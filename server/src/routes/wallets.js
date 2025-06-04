const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Wallet = require('../models/Wallet');
const DailyAsset = require('../models/DailyAsset');

// ✅ 모든 거래소 공통: 등록된 키 조회
router.get('/:exchange', verifyToken, async (req, res) => {
  

  const { exchange } = req.params;
 

  try {
    const wallet = await Wallet.findOne({ user: req.user._id, exchange });
    
    if (!wallet) return res.status(404).json({ message: '등록된 키 없음' });
    res.json(wallet);
  } catch (err) {
    console.error(`[❌ ${exchange} 지갑 조회 실패]`, err.message);
    res.status(500).json({ message: '지갑 조회 실패', error: err.message });
  }
});

// ✅ 모든 거래소 공통: 등록된 키 삭제
// 예시: /routes/wallets.js 내부

// 🔥 API 키 해제 시 지갑 삭제 + 기록 제거
router.delete('/:exchange', verifyToken, async (req, res) => {
  const { exchange } = req.params;

  try {
    // ✅ 1. Wallet 삭제
    await Wallet.findOneAndDelete({
      user: req.user._id,
      exchange
    });

    // ✅ 2. 해당 거래소의 자산 기록만 제거
    await DailyAsset.updateMany(
      { user: req.user._id },
      { $pull: { assets: { exchange } } }
    );

    // ✅ 3. assets 배열이 비어 있는 기록은 완전히 삭제
    await DailyAsset.deleteMany({
      user: req.user._id,
      assets: { $size: 0 }
    });

    res.json({ message: `${exchange} 삭제 완료` });
  } catch (err) {
    console.error(`[❌ ${exchange} 지갑 삭제 실패]`, err.message);
    res.status(500).json({ message: '지갑 삭제 실패', error: err.message });
  }
});

module.exports = router;
