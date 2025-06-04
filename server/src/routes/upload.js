const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// ✅ 1. 저장 경로 및 파일 이름 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 서버 루트 기준 uploads 폴더
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// ✅ 2. 업로드 미들웨어 생성
const upload = multer({ storage });

/*
===========================================
 ✅ [POST] /api/upload
 - 게시글용 일반 파일 업로드
 - 성공 시 { url: '/uploads/파일명' } 반환
===========================================
*/
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '파일이 없습니다.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

/*
===========================================
 ✅ [POST] /api/upload/profile
 - 프로필 전용 업로드 (경로 분리 유지)
===========================================
*/
router.post('/profile', upload.single('profile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '파일이 없습니다.' });
  }

  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;
