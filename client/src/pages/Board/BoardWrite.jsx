import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BoardWrite = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData) {
      alert('로그인 정보가 올바르지 않습니다.');
      navigate('/login');
      return;
    }

    setNickname(userData.nickname || userData.id);
  }, [navigate]);

  const uploadFile = async () => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/api/upload', formData);
    return res.data.url;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const imageUrl = await uploadFile();

    try {
      await axios.post(
        '/api/board',
        {
          title,
          content,
          image: imageUrl, // Quill 본문 안에 이미지는 따로 처리 필요
          writer: nickname,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('게시글이 등록되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error('📛 등록 실패 상세:', err);
      alert(`❌ 등록 실패: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto mt-14 px-6">
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">글쓰기 ✍️</h2>
        </div>
        <div className="p-6 space-y-6">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="bg-white"
            style={{ height: "400px", marginBottom: "20px" }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
          />

          {/* 파일 미리보기 */}
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-full h-auto object-contain rounded-md"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition"
            style={{ position: 'sticky', bottom: '0', left: '0' }}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardWrite;
