// ✅ 환경 변수 로드 (.env 사용)
require("dotenv").config();

// ✅ 필수 모듈 불러오기
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http"); // ✅ Socket.IO와 함께 사용될 서버 객체

// ✅ 내부 모듈 불러오기
const connectDB = require("./config/db"); // MongoDB 연결
const scheduleJobs = require("./jobs"); // 크론 작업 설정
const { initSocket } = require("./socket"); // ✅ Socket.IO 설정 함수 불러오기

// ✅ Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ HTTP 서버 생성 (Socket.IO와 함께 사용)
const server = http.createServer(app);

// ✅ Socket.IO 초기화 및 연결 처리
initSocket(server);

// ✅ Express 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ API 라우터 등록
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
app.use("/api/settings", require("./routes/settings")); // 🔥 자산 변화 추이 설정

// ✅ 크론 작업 등록 및 DB 연결
scheduleJobs();
connectDB();

// ✅ 서버 실행
server.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
