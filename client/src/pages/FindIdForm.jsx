import React, { useState } from 'react';
import axios from 'axios';

const FindIdForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFindId = async () => {
    try {
      await axios.post('/api/auth/find-id', { email });
      setMessage('📩 이메일로 아이디가 전송되었습니다.');
    } catch (err) {
      setMessage(err.response?.data?.message || '전송 실패');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">가입한 이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <button
        onClick={handleFindId}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        아이디 찾기
      </button>

      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </div>
  );
};

export default FindIdForm;
