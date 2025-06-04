const mongoose = require('mongoose');
const Wallet = require('./Wallet'); // ✅ Wallet 모델 불러오기

const UserSchema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
  nickname: String,
  profile: String,
  isAdmin: { type: Boolean, default: false },

  // ✅ 추가된 통계 필드들
  totalLikes: { type: Number, default: 0 },        // 총 좋아요 수
  followersCount: { type: Number, default: 0 },    // 팔로워 수
  followingCount: { type: Number, default: 0 }     // 팔로잉 수
},{
  timestamps: true  // ✅ 이 줄 추가
});
// ✅ 사용자가 MongoDB에서 삭제될 때 연결된 Wallet도 삭제
UserSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Wallet.deleteMany({ user: doc._id });
    console.log(`[🗑️ Wallet] 사용자 ${doc._id} 삭제로 인한 연결 지갑 삭제 완료`);
  }
});

// ✅ 프로필 수정용 static 메서드
UserSchema.statics.patchProfile = async function (userId, profile) {
  return this.findByIdAndUpdate(userId, { profile }, { new: true });
};

module.exports = mongoose.model('User', UserSchema);
