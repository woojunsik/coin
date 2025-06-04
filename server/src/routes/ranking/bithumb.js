const express = require("express");
const RankingCache = require("../../models/RankingCache");
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const cache = await RankingCache.findOne({ exchange: "bithumb" });
    if (!cache) return res.status(404).json({ message: "랭킹 정보 없음" });
    return res.json(cache.rankings);
  } catch (err) {
    console.error("랭킹 캐시 조회 실패:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;