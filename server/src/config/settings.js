
const ratioMin = parseInt(process.env.ASSET_RATIO_INTERVAL || "10", 10);

// ✅ 기존 interval 방식 대신, 직접 크론 표현식으로 처리
const trendCron = process.env.ASSET_TREND_CRON || "0 0 * * *";

module.exports = {
  assetRatioUpdateInterval: ratioMin,
  assetBalanceCron: `*/${ratioMin} * * * *`,
  assetDailyCron: trendCron,
};
