const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Notice = require('../models/Notice');

// ✅ 공지 목록 조회
router.get('/', async (req, res) => {
  const { q = '', sort = 'latest' } = req.query;
  try {
    const keyword = new RegExp(q, 'i');
    let sortOption = { createdAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'likes') sortOption = { likes: -1 };

    const posts = await Notice.find({
      $or: [
        { title: keyword },
        { content: keyword },
        { writer: keyword },
        { 'writer.nickname': keyword },
      ],
    }).sort(sortOption);

    res.json(posts);
  } catch {
    res.status(500).json({ message: '공지 조회 실패' });
  }
});

// ✅ 공지 등록 (관리자만)
router.post('/', verifyToken, async (req, res) => {
  const { title, content, image, writer } = req.body;
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: '관리자만 작성 가능' });
    const post = new Notice({ title, content, image, writer });
    await post.save();
    res.json({ message: '등록 완료', post });
  } catch {
    res.status(500).json({ message: '등록 실패' });
  }
});

// ✅ 상세 보기
// ✅ 게시글 상세 조회 + 댓글/대댓글 writer 정보 확장 적용 (공지사항)
router.get('/:id', async (req, res) => {
  try {
    let post = await Notice.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    post.views += 1;
    await Notice.findByIdAndUpdate(req.params.id, { views: post.views });

    // ✅ 작성자 정보 확장
    if (typeof post.writer === 'string') {
      post.writer = { nickname: post.writer };
    } else {
      const user = await User.findById(post.writer).select('nickname profile');
      post.writer = user || { nickname: '알 수 없음' };
    }

    // ✅ 댓글 + 대댓글 writer 정보 확장
    const processedComments = await Promise.all(
      (post.comments || []).map(async (comment) => {
        const user = await User.findById(comment.writer).select('nickname profile');
        const enrichedReplies = await Promise.all(
          (comment.replies || []).map(async (reply) => {
            const replyUser = await User.findById(reply.writer).select('nickname profile');
            return {
              ...reply,
              writer: replyUser
                ? { _id: replyUser._id, nickname: replyUser.nickname, profile: replyUser.profile }
                : reply.writer,
            };
          })
        );

        return {
          ...comment,
          writer: user
            ? { _id: user._id, nickname: user.nickname, profile: user.profile }
            : comment.writer,
          replies: enrichedReplies
        };
      })
    );
    post.comments = processedComments;

    res.json(post);
  } catch (err) {
    console.error('[공지 상세 조회 오류]', err.message);
    res.status(500).json({ message: '공지 조회 실패', error: err.message });
  }
});


// ✅ 수정 (관리자만)
router.put('/:id', verifyToken, async (req, res) => {
  const { title, content, writer } = req.body;
  try {
    const post = await Notice.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '없음' });
    if (!req.user.isAdmin) return res.status(403).json({ message: '관리자만 수정 가능' });

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();
    res.json({ message: '수정 완료', post });
  } catch {
    res.status(500).json({ message: '수정 실패' });
  }
});

// ✅ 삭제
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: '관리자만 삭제 가능' });
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch {
    res.status(500).json({ message: '삭제 실패' });
  }
});

// ✅ 댓글 등록
router.post('/:id/comment', verifyToken, async (req, res) => {
  const { writer, content, profileImage } = req.body;
  try {
    const post = await Notice.findById(req.params.id);
    const newComment = {
      _id: new Date().getTime().toString(),
      writer,
      content,
      profileImage,
      createdAt: new Date(),
      replies: [],
    };
    post.comments.push(newComment);
    await post.save();
    res.json(newComment);
  } catch {
    res.status(500).json({ message: '댓글 등록 실패' });
  }
});

// ✅ 댓글 수정
router.put('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Notice.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    comment.content = req.body.content;
    await post.save();
    res.json({ message: '댓글 수정 완료', comment });
  } catch {
    res.status(500).json({ message: '댓글 수정 실패' });
  }
});

// ✅ 댓글 삭제
router.delete('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Notice.findById(req.params.postId);
    post.comments = post.comments.filter(c => c._id !== req.params.commentId);
    await post.save();
    res.json({ message: '댓글 삭제 완료' });
  } catch {
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
});

// ✅ 대댓글 등록
router.post('/:postId/comment/:commentId/reply', verifyToken, async (req, res) => {
  const { writer, content, profileImage } = req.body;
  try {
    const post = await Notice.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    const newReply = {
      _id: new Date().getTime().toString(),
      writer,
      content,
      profileImage,
      createdAt: new Date(),
    };
    comment.replies.push(newReply);
    await post.save();
    res.json(newReply);
  } catch {
    res.status(500).json({ message: '대댓글 등록 실패' });
  }
});

// ✅ 대댓글 수정
router.put('/:postId/comment/:commentId/reply/:replyId', verifyToken, async (req, res) => {
  try {
    const post = await Notice.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    const reply = comment.replies.find(r => r._id === req.params.replyId);
    reply.content = req.body.content;
    await post.save();
    res.json({ message: '대댓글 수정 완료', reply });
  } catch {
    res.status(500).json({ message: '대댓글 수정 실패' });
  }
});

// ✅ 대댓글 삭제
router.delete('/:postId/comment/:commentId/reply/:replyId', verifyToken, async (req, res) => {
  try {
    const post = await Notice.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    comment.replies = comment.replies.filter(r => r._id !== req.params.replyId);
    await post.save();
    res.json({ message: '대댓글 삭제 완료' });
  } catch {
    res.status(500).json({ message: '대댓글 삭제 실패' });
  }
});

// ✅ 좋아요 기능
router.post('/:id/like', verifyToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Notice.findById(req.params.id);
    if (post.likedUsers.includes(userId)) {
      return res.status(400).json({ message: '이미 좋아요를 누르셨습니다.' });
    }
    post.likes += 1;
    post.likedUsers.push(userId);
    await post.save();
    res.json({ message: '좋아요 완료', likes: post.likes });
  } catch {
    res.status(500).json({ message: '좋아요 실패' });
  }
});

module.exports = router;
