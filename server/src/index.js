// ✅ 환경 변수 로드 (.env 사용)
require("dotenv").config();

// ✅ 필수 모듈 불러오기
const express = require("express");
const cors = require("cors");
const path = require("path");

// ✅ 내부 모듈 불러오기
const connectDB = require("./config/db"); // MongoDB 연결
const scheduleJobs = require("./jobs"); // 크론 작업 설정

// ✅ Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ 라우터 등록
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/board", require("./routes/board"));
app.use("/api/notice", require("./routes/notice"));
app.use("/api/ticker", require("./routes/ticker"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/crypto-news", require("./routes/cryptoNews"));
app.use("/api/follow", require("./routes/follow"));
app.use("/api/investment", require("./routes/investment"));
app.use("/api/upbit", require("./routes/upbit"));
app.use("/api/bybit", require("./routes/bybit"));
app.use("/api/bithumb", require("./routes/bithumb"));
app.use("/api/binance", require("./routes/binance"));
app.use("/api/coinone", require("./routes/coinone"));

// ✅ 랭킹 관련 라우터
app.use("/api/ranking/all", require("./routes/ranking/all"));
app.use("/api/ranking/upbit", require("./routes/ranking/upbit"));
app.use("/api/ranking/bybit", require("./routes/ranking/bybit"));
app.use("/api/ranking/bithumb", require("./routes/ranking/bithumb"));
app.use("/api/ranking/binance", require("./routes/ranking/binance"));
app.use("/api/ranking/coinone", require("./routes/ranking/coinone"));

app.use("/api/wallets", require("./routes/wallets"));

// ✅ 🔥 자산 변화 추이 라우터 등록
app.use("/api/settings", require("./routes/settings"));

// ✅ 크론 스케줄 등록
scheduleJobs();

// ✅ MongoDB 연결
connectDB();

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
