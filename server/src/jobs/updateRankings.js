// ✅ updateRankings.js 전체 + 자동 스크립트

const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const RankingCacheSchema = new mongoose.Schema({
  exchange: { type: String, required: true, unique: true },
  rankings: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now },
});
const RankingCache =
  mongoose.models.RankingCache ||
  mongoose.model("RankingCache", RankingCacheSchema);

module.exports = async function updateAllRankings() {
  const wallets = await Wallet.find().populate("user", "nickname profile");

  const rankingsByExchange = {};
  for (const wallet of wallets) {
    if (!wallet.user || !wallet.exchange) continue;
    const uid = wallet.user._id.toString();
    const exchange = wallet.exchange;

    if (!rankingsByExchange[exchange]) {
      rankingsByExchange[exchange] = new Map();
    }

    const map = rankingsByExchange[exchange];

    if (!map.has(uid)) {
      map.set(uid, {
        userId: uid,
        nickname: wallet.user.nickname,
        profile: wallet.user.profile,
        totalKRW: wallet.totalKRW || 0,
        assets: wallet.assets || [],
      });
    } else {
      const prev = map.get(uid);
      prev.totalKRW += wallet.totalKRW || 0;
      prev.assets.push(...(wallet.assets || []));
    }
  }

  for (const [exchange, userMap] of Object.entries(rankingsByExchange)) {
    const ranked = Array.from(userMap.values()).sort(
      (a, b) => b.totalKRW - a.totalKRW
    );

    await RankingCache.updateOne(
      { exchange },
      { exchange, rankings: ranked, updatedAt: new Date() },
      { upsert: true }
    );
    console.log(`📊 [${exchange}] 랭킹 ${ranked.length}명 저장 완료`);
  }

  const allMap = new Map();
  for (const map of Object.values(rankingsByExchange)) {
    for (const entry of map.values()) {
      const { userId, totalKRW, nickname, profile, assets } = entry;

      if (!allMap.has(userId)) {
        allMap.set(userId, {
          userId,
          nickname,
          profile,
          totalKRW,
          assets: [...(assets || [])],
        });
      } else {
        const existing = allMap.get(userId);
        existing.totalKRW += totalKRW;
        existing.assets.push(...(assets || []));
      }
    }
  }

  const allRanked = Array.from(allMap.values()).sort(
    (a, b) => b.totalKRW - a.totalKRW
  );

  await RankingCache.updateOne(
    { exchange: "all" },
    { exchange: "all", rankings: allRanked, updatedAt: new Date() },
    { upsert: true }
  );
  console.log(`📊 [all] 전체 랭킹 ${allRanked.length}명 저장 완료`);
};

// ✅ 자동 확인 스크립트 (별도 실행용)
if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB 연결 완료");

    await module.exports();

    const all = await RankingCache.findOne({ exchange: "all" });
    if (!all) return console.error("❌ 랭킹 캐시 없음");

    console.log("✅ 총 랭킹 유저 수:", all.rankings.length);

    const first = all.rankings[0];
    if (!first) return;

    if (!first.assets || first.assets.length === 0) {
      console.warn("⚠️ 보유 코인 없음:", first.nickname);
    } else {
      console.log(
        "📦 대표 유저 코인:",
        first.assets.map((a) => a.currency).join(", ")
      );
    }

    await mongoose.disconnect();
    console.log("✅ DB 연결 종료");
  })();
}
