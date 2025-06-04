import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NoticeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ 관리자 인증 및 데이터 로드
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      alert('로그인이 필요합니다.');
      return navigate('/login');
    }

    if (!user?.isAdmin) {
      alert('관리자만 수정 가능합니다.');
      return navigate('/');
    }

    setIsAdmin(true);

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/notice/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch {
        alert('게시글을 불러올 수 없습니다.');
        navigate('/notice');
      }
    };

    fetchData();
  }, [id, navigate]);

  // ✅ 수정 요청
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert('제목과 내용을 모두 입력하세요.');
    }

    try {
      await axios.put(
        `http://localhost:4000/api/notice/${id}`,
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
      alert('수정 완료');
      navigate(`/notice/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || '수정 실패');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-xl font-bold">📢 공지사항 수정</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          placeholder="제목 입력"
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
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoticeEdit;
