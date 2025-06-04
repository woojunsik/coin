const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // 나
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 내가 팔로우한 대상
  createdAt: { type: Date, default: Date.now }
});

// ❗ 중복 팔로우 방지
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
