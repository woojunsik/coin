const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 유저 소켓 연결:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`✅ ${userId} 유저가 자신의 방에 입장`);
    });

    socket.on("disconnect", () => {
      console.log("❌ 유저 연결 해제:", socket.id);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("❗ Socket.IO 초기화되지 않음");
  }
  return io;
}

module.exports = { initSocket, getIO };
