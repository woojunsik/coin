import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CoinoneRegisterForm({ onSuccess }) {
  const [accessToken, setAccessToken] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/coinone/balance',
        {
          accessToken: accessToken.trim(),
          secretKey: secretKey.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess(res.data);

    } catch (err) {
      console.error('[❌ 인증 실패]', err.response?.data || err.message);

      const message = err.response?.data?.message || '❌ 인증 실패: 자산 조회 실패';
      toast.error(message); // ✅ 에러 메시지

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-4 w-full max-w-md">
      <h4 className="text-lg font-semibold text-gray-800">코인원 API 키 등록</h4>
      <input
        type="text"
        placeholder="Access Token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <input
        type="password"
        placeholder="Secret Key"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCcw size={16} /> {loading ? '등록 중...' : 'API 자산 인증하기'}
      </button>
    </div>
  );
}
