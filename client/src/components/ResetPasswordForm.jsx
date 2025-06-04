import React, { useState } from 'react';
import axios from 'axios';

const ResetPasswordForm = () => {
  const [step, setStep] = useState(1); // 단계: 1=이메일입력, 2=코드입력, 3=새비밀번호
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [message, setMessage] = useState('');

  // ✅ 1단계: 이메일로 인증코드 발송
  const sendCode = async () => {
    try {
      await axios.post('/api/auth/send-reset-code', { id, email });
      setMessage('📩 인증코드를 이메일로 전송했습니다.');
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || '전송 실패');
    }
  };

  // ✅ 2단계: 인증코드 확인
  const verifyCode = async () => {
    try {
      await axios.post('/api/auth/verify-reset-code', { id, code });
      setStep(3);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.message || '인증 실패');
    }
  };

  // ✅ 3단계: 새 비밀번호 입력 후 변경
  const resetPassword = async () => {
    try {
      await axios.post('/api/auth/reset-password', { id, newPassword: newPw });
      setMessage('✅ 비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      setStep(4);
      setTimeout(() => {
        window.location.href = '/login'; // ✅ 로그인 페이지로 자동 이동
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || '변경 실패');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-sm space-y-4">
      <h2 className="text-lg font-bold text-center">🔐 비밀번호 재설정</h2>

      {/* 🔹 Step 1: 아이디/이메일 입력 */}
      {step === 1 && (
        <>
          <div>
            <label className="block font-medium mb-1">아이디</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            onClick={sendCode}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            인증코드 전송
          </button>
        </>
      )}

      {/* 🔹 Step 2: 인증코드 입력 */}
      {step === 2 && (
        <>
          <div>
            <label className="block font-medium mb-1">인증코드 입력</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            onClick={verifyCode}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            인증 확인
          </button>
        </>
      )}

      {/* 🔹 Step 3: 새 비밀번호 입력 */}
      {step === 3 && (
        <>
          <div>
            <label className="block font-medium mb-1">새 비밀번호</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            onClick={resetPassword}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            비밀번호 재설정
          </button>
        </>
      )}

      {/* 🔹 Step 4: 완료 메시지 */}
      {step === 4 && (
        <div className="text-center text-green-600 font-semibold">
          ✅ 완료! 잠시 후 로그인 페이지로 이동합니다.
        </div>
      )}

      {/* 🔸 공통 메시지 출력 */}
      {message && <p className="text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default ResetPasswordForm;
