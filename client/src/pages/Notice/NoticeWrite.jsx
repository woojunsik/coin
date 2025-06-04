import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NoticeWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return navigate('/login');
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.isAdmin) {
      alert('관리자만 작성 가능합니다.');
      return navigate('/');
    }

    setIsAdmin(true);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert('제목과 내용을 입력하세요.');
    }

    try {
      await axios.post(
        'http://localhost:4000/api/notice',
        {
          title,
          content,
          writer: localStorage.getItem('nickname'),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('공지사항이 등록되었습니다.');
      navigate('/notice');
    } catch (err) {
      alert('등록 실패');
      console.error(err);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-xl font-bold">📢 공지사항 작성</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full border px-4 py-2 rounded"
        />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-white"
          style={{ height: '300px' }}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoticeWrite;
