const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Follow = require('../models/Follow');
const User = require('../models/User');

const router = express.Router();

// ✅ [POST] 팔로우 하기
router.post('/:targetId', verifyToken, async (req, res) => {
  const { targetId } = req.params;

  if (req.user._id.toString() === targetId) {
    return res.status(400).json({ message: '자기 자신은 팔로우할 수 없습니다.' });
  }

  try {
    // 대상 유저 존재 확인
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: '팔로우 대상 유저를 찾을 수 없습니다.' });
    }

    // 중복 방지
    const exists = await Follow.findOne({ follower: req.user._id, following: targetId });
    if (exists) {
      return res.status(400).json({ message: '이미 팔로우 중입니다.' });
    }

    // 팔로우 저장
    await Follow.create({ follower: req.user._id, following: targetId });

    // ✅ 통계 업데이트
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });

    res.json({ message: '팔로우 완료' });
  } catch (err) {
    console.error('[팔로우 실패]', err.message);
    res.status(500).json({ message: '팔로우 실패', error: err.message });
  }
});

// ✅ [DELETE] 언팔로우 하기
router.delete('/:targetId', verifyToken, async (req, res) => {
  const { targetId } = req.params;

  try {
    const deleted = await Follow.findOneAndDelete({ follower: req.user._id, following: targetId });
    if (!deleted) {
      return res.status(404).json({ message: '팔로우 관계가 존재하지 않습니다.' });
    }

    // ✅ 통계 감소
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });

    res.json({ message: '언팔로우 완료' });
  } catch (err) {
    console.error('[언팔로우 실패]', err.message);
    res.status(500).json({ message: '언팔로우 실패', error: err.message });
  }
});


// ✅ [GET] 내가 팔로우한 유저 목록 (팔로잉 리스트)
// - 특정 유저 ID가 팔로우 중인 유저들 조회
router.get('/following/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const list = await Follow.find({ follower: userId })
      .populate('following', 'nickname profile');
    res.json(list.map(f => f.following));
  } catch (err) {
    console.error('[팔로잉 목록 오류]', err.message);
    res.status(500).json({ message: '팔로잉 목록 실패', error: err.message });
  }
});


// ✅ [GET] 나를 팔로우한 유저 목록 (팔로워 리스트)
// - 특정 유저 ID를 팔로우하는 유저들 조회
router.get('/followers/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const list = await Follow.find({ following: userId })
      .populate('follower', 'nickname profile');
    res.json(list.map(f => f.follower));
  } catch (err) {
    console.error('[팔로워 목록 오류]', err.message);
    res.status(500).json({ message: '팔로워 목록 실패', error: err.message });
  }
});

module.exports = router;
