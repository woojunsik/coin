import React from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm'; // 폼이 컴포넌트 폴더에 있다면

const ResetPasswordPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">비밀번호 재설정</h2>
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage;
