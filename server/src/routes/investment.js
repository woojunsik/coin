const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const DailyAsset = require("../models/DailyAsset");
const mongoose = require("mongoose");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ message: "잘못된 사용자 ID" });

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const wallets = await Wallet.find({ user: userObjectId });
    const history = await DailyAsset.find({ user: userObjectId }).sort({
      date: 1,
    });

    const dailyAssets = history.map((h) => ({
      date: h.date.toISOString().split("T")[0],
      totalKRW: Math.floor(h.totalKRW),
    }));

    const exchanges = [
  ...new Set(
    history.flatMap((h) => h.assets?.map((a) => a.exchange)).filter(Boolean)
  )
];


    const totalAssets = wallets.reduce(
      (sum, w) => sum + Math.floor(w.totalKRW || 0),
      0
    );
    const assets = wallets.flatMap((w) =>
      (w.assets || []).map((a) => ({ ...a, exchange: w.exchange }))
    );

    const dailyAssetsByExchange = {};
    for (const ex of exchanges) {
      dailyAssetsByExchange[ex] = history.map((day) => {
        const coins = day.assets?.filter((a) => a.exchange === ex) || [];
        const sum = coins.reduce((acc, c) => acc + (c.krw || 0), 0);
        return { date: day.date.toISOString().split("T")[0], totalKRW: sum };
      });
    }

    const rank =
      (await Wallet.countDocuments({ totalKRW: { $gt: totalAssets } })) + 1;
      const latest = await DailyAsset.findOne({ user: userObjectId }).sort({ date: -1 });

    res.json({
      exchanges,
      totalAssets,
      rank,
      dailyAssets,
      dailyAssetsByExchange,
      assets,
       lastUpdatedAt: latest?.date,
    });
  } catch (err) {
    console.error("투자현황 API 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
