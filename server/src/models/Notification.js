const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 알림 받을 유저
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 알림 발생 유저
  type: { type: String, enum: ["comment", "postLike", "commentLike", "follow"], required: true },
  message: { type: String, required: true },
  url: { type: String }, // 클릭 시 이동할 주소
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
