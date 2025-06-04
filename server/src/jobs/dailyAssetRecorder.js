const User = require("../models/User");
const Wallet = require("../models/Wallet");
const DailyAsset = require("../models/DailyAsset");

module.exports = async () => {
  console.log("📊 [자산 기록] 유저 자산 기록 시작");

  try {
    const users = await User.find();

    for (const user of users) {
      const wallets = await Wallet.find({ user: user._id });
      const validWallets = wallets.filter(
        (w) => Array.isArray(w.assets) && w.assets.length > 0
      );
      if (validWallets.length === 0) continue;

      const totalKRW = validWallets.reduce(
        (sum, wallet) => sum + (wallet.totalKRW || 0),
        0
      );
      const flatAssets = validWallets.flatMap((w) =>
        (w.assets || []).map((a) => ({ ...a, exchange: w.exchange }))
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await DailyAsset.updateOne(
        { user: user._id, date: today },
        {
          $setOnInsert: {
            user: user._id,
            date: new Date(),
            totalKRW,
            assets: flatAssets,
          },
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("❌ 자산 기록 실패:", err.message);
  }
};
