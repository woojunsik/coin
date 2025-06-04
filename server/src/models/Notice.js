const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  writer: String,
  content: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  writer: String,
  content: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema],
});

const noticeSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  writer: mongoose.Schema.Types.Mixed, // 문자열 또는 객체
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedUsers: [String],
  comments: [commentSchema],
}, {
  timestamps: true
});

// ✅ 이미 등록된 모델이면 그대로 사용하고, 아니면 새로 등록
module.exports = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
