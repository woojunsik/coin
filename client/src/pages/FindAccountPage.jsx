import React, { useState } from 'react';
import FindIdForm from './FindIdForm';
import ResetPasswordForm from '@/components/ResetPasswordForm';

const FindAccountPage = () => {
  const [mode, setMode] = useState('id'); // 'id' or 'pw'

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">계정 찾기</h2>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setMode('id')}
          className={`${mode === 'id' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => setMode('pw')}
          className={`${mode === 'pw' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          비밀번호 재설정
        </button>
      </div>

      {mode === 'id' ? <FindIdForm /> : <ResetPasswordForm />}
    </div>
  );
};

export default FindAccountPage;
