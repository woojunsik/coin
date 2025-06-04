import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCcw } from 'lucide-react';

export default function BinanceRegisterForm({ onSuccess }){
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        '/api/binance/balance',
        {
          accessKey: accessKey.trim(),
          secretKey: secretKey.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      alert('✅ 인증 및 자산 조회 성공!');
      onSuccess(res.data);
    } catch (err) {
      console.error('[❌ 인증 실패]', err.response?.data || err.message);
      alert('❌ 인증 실패: 자산 조회 실패');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-4 w-full max-w-md">
      <h4 className="text-lg font-semibold text-gray-800">바이낸스 API 키 등록</h4>
      <input
        type="text"
        placeholder="Access Key"
        value={accessKey}
        onChange={(e) => setAccessKey(e.target.value)}
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

