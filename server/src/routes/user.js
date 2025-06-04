const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Board');
const verifyToken = require('../middleware/verifyToken');

/*
===========================================
✅ [GET] 로그인된 사용자 정보 조회 (/api/user)
===========================================
*/
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('nickname email profile isAdmin createdAt');
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    res.json(user);
  } catch (err) {
    console.error('[유저 정보 조회 실패]', err.message);
    res.status(500).json({ message: '유저 정보를 불러올 수 없습니다.' });
  }
});


/*
===========================================
✅ [PATCH] 유저 ID 기반 프로필 수정 (/api/user/:userId)
===========================================
*/
router.patch('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { profile } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { profile }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: '유저 없음' });
    res.json(updatedUser);
  } catch (err) {
    console.error('프로필 업데이트 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/*
===========================================
✅ [PUT] 닉네임 기반 프로필 업데이트 (/api/user/:nickname/profile)
===========================================
*/
router.put('/:nickname/profile', async (req, res) => {
  try {
    const decodedNickname = decodeURIComponent(req.params.nickname);
    const { profile } = req.body;

    const user = await User.findOneAndUpdate(
      { nickname: decodedNickname },
      { profile },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: '사용자 없음' });
    res.json({ message: '프로필 업데이트 완료', profile: user.profile });
  } catch (err) {
    console.error('프로필 업데이트 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/*
===========================================
✅ [GET] 닉네임으로 사용자 정보 조회 (/api/user/:nickname)
===========================================
*/
router.get('/:nickname', async (req, res) => {
  try {
    const decodedNickname = decodeURIComponent(req.params.nickname);
    const user = await User.findOne({ nickname: decodedNickname }).select('-password');
    if (!user) return res.status(404).json({ message: '사용자 없음' });
    res.json(user);
  } catch (err) {
    console.error('유저 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/*
===========================================
✅ [GET] 유저 활동 통계 (/api/user/:nickname/stats)
===========================================
*/
router.get('/:nickname/stats', async (req, res) => {
  try {
    const decodedNickname = decodeURIComponent(req.params.nickname);
    const user = await User.findOne({ nickname: decodedNickname });
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    const userId = user._id;
    const followers = await Follow.countDocuments({ following: userId });
    const following = await Follow.countDocuments({ follower: userId });

    const posts = await Post.find({ writer: userId });
    const postLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

    let commentLikes = 0;
    const allPosts = await Post.find();
    for (const post of allPosts) {
      for (const comment of post.comments || []) {
        if (String(comment.writer) === String(userId)) {
          commentLikes += comment.likes || 0;
        }
      }
    }

    const totalLikes = postLikes + commentLikes;
    res.json({ followers, following, totalLikes });
  } catch (err) {
    console.error('[활동 통계 조회 실패]', err.message);
    res.status(500).json({ message: '서버 오류' });
  }
});

/*
===========================================
✅ [GET] 닉네임 기반 댓글 수 조회 (/api/user/:nickname/comments/count)
===========================================
*/
router.get('/:nickname/comments/count', async (req, res) => {
  try {
    const nickname = decodeURIComponent(req.params.nickname);
    const user = await User.findOne({ nickname });
    if (!user) return res.json({ nickname, commentCount: 0 });

    const userId = user._id.toString();
    const boards = await Post.find().lean();

    let commentCount = 0;
    boards.forEach(post => {
      (post.comments || []).forEach(comment => {
        if (comment.writer?.toString() === userId) commentCount++;
        (comment.replies || []).forEach(reply => {
          if (reply.writer?.toString() === userId) commentCount++;
        });
      });
    });

    res.json({ nickname, commentCount });
  } catch (err) {
    console.error('[댓글 수 조회 실패]', err.message);
    res.status(500).json({ message: '댓글 수 조회 실패' });
  }
});

module.exports = router;
