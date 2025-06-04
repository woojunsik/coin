const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // ✅ ObjectId 변환용 import 추가

// ✅ JWT 토큰을 검증하는 미들웨어
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ 1. Authorization 헤더가 없을 경우 (토큰 미제공)
  if (!authHeader) {
    return res.status(401).json({ message: '토큰 없음 (Authorization 헤더 누락)' });
  }

  // ✅ 2. 'Bearer 토큰' 형식에서 토큰 분리
  const token = authHeader.split(' ')[1];

  try {
    // ✅ 3. 토큰 검증 (환경변수의 JWT_SECRET 사용)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_dev_secret_key');

    // ✅ 4. 사용자 정보 구성 - ObjectId로 변환하여 DB 참조 가능하게 처리
    req.user = {
      _id: new mongoose.Types.ObjectId(decoded.id),  // 👈 핵심: populate를 위해 ObjectId로 변환
      nickname: decoded.nickname,
      isAdmin: decoded.isAdmin,
    };

    // ✅ 5. 다음 미들웨어 또는 라우터로 진행
    next();
  } catch (err) {
    // ✅ 핵심: 만료된 토큰은 따로 감지해서 알려주자
    if (err.name === 'TokenExpiredError') {
      console.warn('[토큰 만료]', err.message);
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인 해주세요.' });
    }

    return res.status(403).json({ message: '토큰 검증 실패', error: err.message });
  }
};

module.exports = verifyToken;
