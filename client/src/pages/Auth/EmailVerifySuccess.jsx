// /client/src/pages/EmailVerifySuccess.jsx

import React from "react";

const EmailVerifySuccess = () => {
  return (
    <div className="max-w-lg mx-auto text-center mt-20 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">🎉 이메일 인증 완료!</h2>
      <p className="text-gray-600">이제 로그인하여 AlphaDrop의 모든 기능을 이용할 수 있습니다.</p>
      <a
        href="/login"
        className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        로그인하러 가기
      </a>
    </div>
  );
};

export default EmailVerifySuccess;
