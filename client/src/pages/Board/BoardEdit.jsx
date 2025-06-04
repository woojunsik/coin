import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BoardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // ✅ 게시글 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/board/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content || '');
      } catch (err) {
        alert('게시글을 불러오지 못했습니다.');
        navigate('/board');
      }
    };

    fetchPost();
  }, [id, navigate]);

  // ✅ 수정 요청
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return alert('제목과 내용을 입력하세요.');
    }

    try {
      await axios.put(
        `http://localhost:4000/api/board/${id}`,
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

      alert('게시글이 수정되었습니다.');
      navigate(`/board/${id}`);
    } catch (err) {
      alert('수정 중 오류 발생');
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-xl font-bold">✏️ 게시글 수정</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="제목을 입력하세요"
        />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-white"
          style={{ height: "400px" }}
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardEdit;
