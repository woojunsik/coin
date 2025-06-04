// client/src/socket.js
import { io } from "socket.io-client";

// 서버 주소 입력 (개발 환경 기준)
const socket = io("http://localhost:4000/");

export default socket;
