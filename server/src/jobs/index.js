const cron = require("node-cron");
const recordDailyAssets = require("./dailyAssetRecorder");
const updateBalances = require("./updateBalances");

module.exports = () => {
  const { assetDailyCron } = require("../config/settings");
  cron.schedule(assetDailyCron, () => {
    console.log("[⏰ Daily Job] 자산 기록 시작");
    recordDailyAssets();
  });
  updateBalances();
};
