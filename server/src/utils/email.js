require('dotenv').config();
const nodemailer = require('nodemailer');

// ✅ Gmail 기반 메일 발송기
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ 1. 회원가입 이메일 인증코드 전송
const sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"AlphaDrop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'AlphaDrop 이메일 인증코드',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2c3e50;">🔐 이메일 인증코드</h2>
        <p>아래 인증코드를 입력하여 이메일을 인증해주세요.</p>
        <div style="font-size: 24px; font-weight: bold; color: #2980b9; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #888;">이 코드는 5분간 유효합니다.</p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa;">본 메일은 AlphaDrop 회원가입을 위한 인증 용도로 발송되었습니다.</p>
      </div>
    `,
  });
};

// ✅ 2. 아이디 찾기 이메일 전송
const sendIdEmail = async (to, id) => {
  await transporter.sendMail({
    from: `"AlphaDrop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'AlphaDrop 계정 아이디 안내',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2>📌 아이디 찾기 결과</h2>
        <p>요청하신 이메일로 등록된 아이디는 아래와 같습니다:</p>
        <div style="font-size: 20px; font-weight: bold; margin: 20px 0; color: #2c3e50;">
          ${id}
        </div>
        <p style="font-size: 12px; color: #aaa;">본 메일은 AlphaDrop 아이디 찾기 요청에 따른 자동 발송입니다.</p>
      </div>
    `,
  });
};

// ✅ 3. 비밀번호 재설정 인증코드 전송
const sendResetCodeEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"AlphaDrop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'AlphaDrop 비밀번호 재설정 코드',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2>🔑 비밀번호 재설정 인증코드</h2>
        <p>아래 인증코드를 입력하여 비밀번호를 재설정해주세요.</p>
        <div style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #888;">이 코드는 5분간 유효하며, 본인만 사용해야 합니다.</p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa;">본 메일은 AlphaDrop 비밀번호 재설정 요청에 따라 발송되었습니다.</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendIdEmail,
  sendResetCodeEmail,
};
