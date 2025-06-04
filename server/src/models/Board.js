const mongoose = require('mongoose');


// ✅ 댓글 스키마
const commentSchema = new mongoose.Schema({
  _id: String,
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, // ✅ 추가
  likedUsers: [String], // ✅ 추가
});

// ✅ 자유게시판 스키마
const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedUsers: [String],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Board || mongoose.model('Board', boardSchema);
