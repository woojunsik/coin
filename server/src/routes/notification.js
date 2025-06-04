const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

// ✅ [GET] 내 알림 전체 조회
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "nickname profile");

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "알림 조회 실패" });
  }
});

// ✅ [PATCH] 읽음 처리
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "읽음 처리 완료" });
  } catch (err) {
    res.status(500).json({ message: "읽음 처리 실패" });
  }
});

module.exports = router;
