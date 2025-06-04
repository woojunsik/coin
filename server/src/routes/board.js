const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const getUserInfo = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findOne({ nickname: id }).select('nickname profile');
      return user ? { nickname: user.nickname, profile: user.profile } : { nickname: id };
    }
    const user = await User.findById(id).select('nickname profile');
    return user ? { _id: user._id, nickname: user.nickname, profile: user.profile } : { nickname: '알 수 없음' };
  } catch {
    return { nickname: '알 수 없음' };
  }
};

// ✅ 게시글 전체 조회
router.get('/', async (req, res) => {
  const { q = '', sort = 'latest', writer } = req.query;
  try {
    const keyword = new RegExp(q, 'i');
    let sortOption = { createdAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'likes') sortOption = { likes: -1 };

    const filter = {
      $or: [{ title: keyword }, { content: keyword }]
    };
    if (writer) {
      const user = await User.findOne({ nickname: writer });
      if (user) filter['writer'] = user._id;
    }

    const boards = await Board.find(filter).sort(sortOption).lean();

    const processed = await Promise.all(boards.map(async board => {
      const boardWriter = await getUserInfo(board.writer);

      const processedComments = await Promise.all((board.comments || []).map(async comment => {
        const commentWriter = await getUserInfo(comment.writer);
        return {
          ...comment,
          writer: commentWriter
        };
      }));

      return {
        ...board,
        writer: boardWriter,
        comments: processedComments
      };
    }));

    res.json(processed);
  } catch (err) {
    console.error('[게시글 전체 조회 오류]', err.message);
    res.status(500).json({ message: '게시글 불러오기 실패' });
  }
});

// ✅ 게시글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      userId = decoded.id;
    }

    let post = await Board.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    post.views += 1;
    await Board.findByIdAndUpdate(req.params.id, { views: post.views });

    post.writer = await getUserInfo(post.writer);

    post.liked = userId ? post.likedUsers?.some(uid => uid.toString() === userId) : false;
    post.likedUserDetails = await Promise.all(
      (post.likedUsers || []).map(uid => getUserInfo(uid))
    );

    const processedComments = await Promise.all((post.comments || []).map(async comment => {
      const commentWriter = await getUserInfo(comment.writer);
      const liked = userId ? (comment.likedUsers || []).some(uid => uid.toString() === userId) : false;
      const likedUserDetails = await Promise.all(
        (comment.likedUsers || []).map(uid => getUserInfo(uid))
      );
      return {
        ...comment,
        writer: commentWriter,
        liked,
        likedUserDetails,
        likes: comment.likes || 0
      };
    }));

    post.comments = processedComments;

    res.json(post);
  } catch (err) {
    console.error('[게시글 상세 조회 오류]', err.message);
    res.status(500).json({ message: '게시글 조회 실패' });
  }
});

// 게시글 작성
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const post = new Board({ title, content, image, writer: req.user._id });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('[게시글 작성 오류]', err.message);
    res.status(500).json({ message: '게시글 작성 실패' });
  }
});

// 게시글 수정
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const post = await Board.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });
    if (post.writer.toString() !== userId) return res.status(403).json({ message: '수정 권한 없음' });

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();
    res.json({ message: '수정 완료', post });
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
});

// 게시글 삭제
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패' });
  }
});

// 댓글 등록
router.post('/:id/comment', verifyToken, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Board.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    const newComment = {
      _id: new Date().getTime().toString(),
      writer: req.user._id,
      content,
      createdAt: new Date(),
      likes: 0,
      likedUsers: []
    };

    post.comments.push(newComment);
    await post.save();

    const user = await getUserInfo(req.user._id);
    res.json({ ...newComment, writer: user });
  } catch (err) {
    res.status(500).json({ message: '댓글 등록 실패' });
  }
});

// 댓글 수정
router.put('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Board.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: '댓글 없음' });

    comment.content = req.body.content;
    await post.save();
    res.json({ message: '댓글 수정 완료', comment });
  } catch (err) {
    res.status(500).json({ message: '댓글 수정 실패' });
  }
});

// 댓글 삭제
router.delete('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Board.findById(req.params.postId);
    post.comments = post.comments.filter(c => c._id !== req.params.commentId);
    await post.save();
    res.json({ message: '댓글 삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
});

// 게시글 좋아요
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const post = await Board.findById(req.params.id);

    const index = post.likedUsers.findIndex(uid => uid.toString() === userId);
    if (index !== -1) {
      post.likedUsers.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedUsers.push(userId);
      post.likes += 1;
    }

    await post.save();
    res.json({ liked: index === -1, likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: '좋아요 처리 실패' });
  }
});

// 댓글 좋아요
router.post('/:id/comment/:commentId/like', verifyToken, async (req, res) => {
  try {
    const post = await Board.findById(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: '댓글 없음' });

    const userId = req.user._id.toString();
    if (!comment.likedUsers) comment.likedUsers = [];

    const index = comment.likedUsers.findIndex(uid => uid.toString() === userId);
    if (index !== -1) {
      comment.likedUsers.splice(index, 1);
      comment.likes = Math.max(0, (comment.likes || 1) - 1);
    } else {
      comment.likedUsers.push(userId);
      comment.likes = (comment.likes || 0) + 1;
    }

    await post.save();

    res.json({
      liked: index === -1,
      likes: comment.likes
    });
  } catch (err) {
    console.error('[댓글 좋아요 실패]', err.message);
    res.status(500).json({ message: '댓글 좋아요 실패' });
  }
});

// ✅ 내가 좋아요한 글 목록
router.get('/liked/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Board.find({ likedUsers: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('[좋아요한 글 불러오기 실패]', err.message);
    res.status(500).json({ message: '좋아요한 글 불러오기 실패' });
  }
});


module.exports = router;
