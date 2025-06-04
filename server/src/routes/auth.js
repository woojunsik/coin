const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'default_dev_secret_key';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB 제한
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
    cb(null, true);
  }
});

const emailCodes = new Map();
const resetCodes = new Map();
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const validatePassword = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(pw);

// ✅ 중복 체크
router.get('/check', async (req, res) => {
  const { field, value } = req.query;
  const exists = await User.findOne({ [field]: value });
  res.json({ available: !exists });
});

// ✅ 이메일 인증 코드 발송
router.post('/send-code', async (req, res) => {
  const { email } = req.body;
  const code = generateCode();
  emailCodes.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000, verified: false });

  try {
    await sendVerificationEmail(email, `회원가입 인증코드: ${code}`);
    res.json({ message: '인증코드 전송 완료' });
  } catch {
    res.status(500).json({ message: '이메일 전송 실패' });
  }
});

// ✅ 인증코드 확인
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = emailCodes.get(email);
  if (!record || Date.now() > record.expiresAt || record.code !== code)
    return res.status(400).json({ message: '인증코드 오류' });

  emailCodes.set(email, { ...record, verified: true });
  res.json({ message: '이메일 인증 완료' });
});

// ✅ 회원가입
router.post('/register', upload.single('profile'), async (req, res) => {
  const { id, password, nickname, email } = req.body;

  if (!validatePassword(password)) return res.status(400).json({ message: '비밀번호 조건 오류' });
  if (await User.findOne({ $or: [{ id }, { nickname }, { email }] }))
    return res.status(400).json({ message: '중복된 아이디/닉네임/이메일' });

  const emailVerified = emailCodes.get(email);
  if (!emailVerified?.verified) return res.status(403).json({ message: '이메일 인증 필요' });

  const hashed = await bcrypt.hash(password, 10);
  const profilePath = req.file ? `/uploads/${req.file.filename}` : '/default-profile.png';

  const newUser = new User({ id, password: hashed, nickname, email, profile: profilePath, isAdmin: false });
  await newUser.save();
  emailCodes.delete(email);

  res.json({ message: '회원가입 완료' });
});

// ✅ 로그인
router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ message: '존재하지 않는 사용자' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: '비밀번호 불일치' });

  const token = jwt.sign(
    { id: user._id, nickname: user.nickname, isAdmin: user.isAdmin },
    SECRET_KEY, { expiresIn: '7d' }
  );

  res.json({
    message: '로그인 성공',
    token,
    user: {
      id: user.id,
      nickname: user.nickname,
      profile: user.profile,
      isAdmin: user.isAdmin,
      walletAddress: user.walletAddress || '',
      walletVerified: user.walletVerified || false,
    }
  });
});

// ✅ 아이디 찾기
router.post('/find-id', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: '계정 없음' });

  await sendVerificationEmail(email, `요청하신 아이디: ${user.id}`);
  res.json({ message: '이메일로 아이디 전송 완료' });
});

// ✅ 비밀번호 재설정 요청
router.post('/send-reset-code', async (req, res) => {
  const { id, email } = req.body;
  const user = await User.findOne({ id, email });
  if (!user) return res.status(404).json({ message: '사용자 정보 불일치' });

  const code = generateCode();
  resetCodes.set(id, { code, expires: Date.now() + 5 * 60 * 1000, verified: false });
  await sendVerificationEmail(email, `비밀번호 재설정 코드: ${code}`);
  res.json({ message: '인증코드 전송 완료' });
});

// ✅ 비밀번호 재설정 인증
router.post('/verify-reset-code', (req, res) => {
  const { id, code } = req.body;
  const record = resetCodes.get(id);
  if (!record || record.code !== code || Date.now() > record.expires)
    return res.status(400).json({ message: '인증코드 오류' });

  resetCodes.set(id, { ...record, verified: true });
  res.json({ message: '인증 성공' });
});

// ✅ 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  const { id, newPassword } = req.body;
  const record = resetCodes.get(id);
  if (!record?.verified) return res.status(403).json({ message: '인증되지 않음' });
  if (!validatePassword(newPassword)) return res.status(400).json({ message: '비밀번호 조건 오류' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ id }, { password: hashed });
  resetCodes.delete(id);
  res.json({ message: '비밀번호 재설정 완료' });
});

// ✅ 프로필 이미지 변경
router.post('/profile', upload.single('profile'), async (req, res) => {
  const { id } = req.body;
  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ message: '사용자 없음' });

  const newPath = req.file ? `/uploads/${req.file.filename}` : user.profile;
  await User.findOneAndUpdate({ id }, { profile: newPath });
  res.json({ message: '프로필 변경 완료', profile: newPath });
});

// ✅ 기존 비밀번호 변경
router.post('/change-password', async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ message: '사용자 없음' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: '기존 비밀번호 불일치' });
  if (!validatePassword(newPassword)) return res.status(400).json({ message: '비밀번호 조건 오류' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ id }, { password: hashed });
  res.json({ message: '비밀번호 변경 완료' });
});

module.exports = router;
