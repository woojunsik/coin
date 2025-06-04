// ✅ RegisterPage 통합 완성본
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [form, setForm] = useState({
    id: '',
    password: '',
    nickname: '',
    email: '',
    profile: null,
    agreed: false,
  });

  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState({ id: null, nickname: null, email: null });
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [preview, setPreview] = useState('/default-profile.png');

  useEffect(() => {
    fetch('/terms.txt')
      .then((res) => res.text())
      .then((text) => setTermsText(text));
  }, []);

  useEffect(() => {
    if (codeSent && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent, timeLeft]);

  const checkDuplicate = async (field, value) => {
    if (!value) {
      setAvailability(prev => ({ ...prev, [field]: null }));
      return;
    }
    const fieldMap = {
      id: '아이디',
      nickname: '닉네임',
      email: '이메일',
    };

    try {
      const res = await axios.get(`/api/auth/check?field=${field}&value=${value}`);
      setAvailability(prev => ({ ...prev, [field]: res.data.available }));
      setErrors(prev => ({ ...prev, [field]: res.data.available ? '' : `이미 사용 중인 ${fieldMap[field]}입니다.` }));
      
    } catch {
      setErrors(prev => ({ ...prev, [field]: '중복 확인 오류' }));
    }
  };

  const validateLive = (name, value) => {
    const pwReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    const nickReg = /^[가-힣a-zA-Z0-9]{2,}$/;
    const onlyNum = /^[0-9]+$/;

    let msg = '';
    if (name === 'id') {
      if (!value) {
        msg = '아이디를 입력해주세요.';
        setAvailability(prev => ({ ...prev, id: null }));
      } else checkDuplicate('id', value);
    }
    if (name === 'password' && !pwReg.test(value)) {
      msg = '비밀번호는 특수문자, 대소문자 포함 8자 이상이어야 합니다.';
    }
    if (name === 'nickname') {
      if (!value) {
        msg = '닉네임을 입력해주세요.';
        setAvailability(prev => ({ ...prev, nickname: null }));
      } else if (!nickReg.test(value) || onlyNum.test(value)) {
        msg = '닉네임은 특수문자 없이 2자 이상 (숫자만 ❌)';
      } else checkDuplicate('nickname', value);
    }
    if (name === 'email') {
      if (!value) {
        msg = '이메일을 입력해주세요.';
        setAvailability(prev => ({ ...prev, email: null }));
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        msg = '이메일 형식이 올바르지 않습니다.';
      } else checkDuplicate('email', value);
    }

    setErrors(prev => ({ ...prev, [name]: msg }));
  };

  const onChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'profile') {
      const file = files[0];
      setForm(prev => ({ ...prev, profile: file }));
      setPreview(file ? URL.createObjectURL(file) : '/default-profile.png');
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      validateLive(name, value);
    }
  };

  const sendCode = async () => {
    try {
      await axios.post('/api/auth/send-code', { email: form.email });
      alert('인증코드를 이메일로 전송했습니다.');
      setCodeSent(true);
      setTimeLeft(300);
    } catch {
      alert('이메일 전송 실패');
    }
  };

  const verifyCode = async () => {
    try {
      const res = await axios.post('/api/auth/verify-code', { email: form.email, code });
      alert(res.data.message);
      setVerified(true);
    } catch {
      alert('인증 실패');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) return alert('약관 동의 필요');
    if (!verified) return alert('이메일 인증 필요');
    if (Object.values(errors).some(Boolean)) return alert('입력값 확인');

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'profile' && !v) data.append('defaultProfile', '/default-profile.png');
      else if (k !== 'agreed') data.append(k, v);
    });

    try {
      await axios.post('/api/auth/register', data);
      alert('회원가입 완료');
      window.location.href = '/';
    } catch (err) {
      alert(err.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10 text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">회원가입</h2>

      {/* 프로필 이미지 미리보기 */}
      <div className="flex flex-col items-center gap-2 mb-4">
  <img src={preview} alt="프로필" className="w-24 h-24 object-cover rounded-full border" />
  <div className="h-4"></div>
  <label className="cursor-pointer inline-block bg-gray-100 text-sm text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
  프로필 선택
  <input type="file" name="profile" accept="image/*" onChange={onChange} className="hidden" />
</label>

</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 각 입력 필드 */}
        {['id', 'password', 'nickname', 'email'].map((field) => (
          <div key={field}>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              placeholder={field === 'id' ? '아이디' : field === 'nickname' ? '닉네임' : field === 'email' ? '이메일' : '비밀번호'}
              value={form[field]}
              onChange={onChange}
              className={`w-full border px-3 py-2 rounded ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            {availability[field] && form[field] && (
              <p className="text-green-500 text-xs">사용 가능한 {field === 'id' ? '아이디' :field === 'nickname' ? '닉네임' : field}입니다.</p>
              
            )}
          </div>
        ))}

        {/* 이메일 인증 */}
        {verified ? (
          <p className="text-green-600 text-sm">✅ 인증 완료</p>
        ) : codeSent ? (
          <div className="space-y-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증코드 입력"
              className="w-full border px-3 py-2 rounded"
            />
            <button type="button" onClick={verifyCode} className="w-full bg-blue-500 text-white py-2 rounded">
              인증 확인
            </button>
            {timeLeft > 0 && <p className="text-xs text-gray-500">남은 시간: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>}
          </div>
        ) : (
          <button type="button" onClick={sendCode} className="w-full bg-gray-700 text-white py-2 rounded">
            이메일 인증 요청
          </button>
        )}


        {/* 약관 동의 */}
        <div className="flex items-center gap-2">
          <input type="checkbox" name="agreed" checked={form.agreed} onChange={onChange} />
          <label className="text-sm text-gray-800">
            <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 underline">이용 약관</button> 및 개인정보 처리방침 동의
          </label>
        </div>

        {/* 약관 모달 */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">이용 약관</h3>
              <div className="h-64 overflow-y-auto border p-2 whitespace-pre-wrap text-xs">{termsText}</div>
              <div className="text-right mt-2">
                <button onClick={() => setShowTerms(false)} className="px-3 py-1 bg-gray-200 rounded">닫기</button>
              </div>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!form.agreed}
          className={`w-full py-2 rounded text-white ${form.agreed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
