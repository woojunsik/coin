// ✅ NoticeDetail.jsx - 기능 전체 유지 + 최신 연동 구조 통일 + UX 개선 반영
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const NoticeDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyInputIndex, setReplyInputIndex] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.isAdmin === true;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/notice/${postId}`);
        setPost(res.data);
        setComments(res.data.comments || []);
      } catch {
        alert('게시글을 불러올 수 없습니다.');
        navigate('/notice');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, navigate]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`/api/notice/${postId}/comment`, {
        content: commentText
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch {
      alert('댓글 등록 실패');
    }
  };

  const handleReplySubmit = async (commentId, index) => {
    try {
      const res = await axios.post(`/api/notice/${postId}/comment/${commentId}/reply`, {
        content: replyText
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updated = [...comments];
      updated[index].replies = [...(updated[index].replies || []), res.data];
      setComments(updated);
      setReplyText('');
      setReplyInputIndex(null);
    } catch {
      alert('답글 등록 실패');
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ 게시글 불러오는 중...</p>;
  if (!post) return <p className="text-center mt-10">존재하지 않는 게시글입니다.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 mt-10 rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <div className="text-sm text-gray-600 mb-4 flex justify-between">
        <span>✍ 작성자: {post.writer?.nickname || post.writer}</span>
        <span>👁 {post.views || 0} ｜ 👍 {post.likes || 0}</span>
      </div>
      <Viewer initialValue={post.content} />

      {isAdmin && (
        <div className="mt-6 flex justify-end gap-2">
          <Link to={`/notice/edit/${post._id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">수정</Link>
          <button onClick={async () => {
            if (window.confirm('정말 삭제할까요?')) {
              try {
                await axios.delete(`/api/notice/${post._id}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('삭제 완료');
                navigate('/notice');
              } catch {
                alert('삭제 실패');
              }
            }
          }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">삭제</button>
        </div>
      )}

      <div className="mt-10">
        <h3 className="font-semibold mb-2">💬 댓글</h3>
        {comments.map((c, i) => (
          <div key={c._id} className="border p-2 rounded bg-gray-50">
            <div className="flex items-start gap-2">
              <img src={c.profileImage || '/default-profile.png'} alt="프로필" className="w-10 h-10 rounded-full object-cover border" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.writer?.nickname || c.writer}</div>
                {editingIndex === i ? (
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border px-2 py-1 text-sm rounded"
                  />
                ) : (
                  <div className="text-sm">{c.content}</div>
                )}
                <div className="text-xs text-right text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                {user.nickname === (c.writer?.nickname || c.writer) && (
                  <div className="flex gap-2 mt-1">
                    {editingIndex === i ? (
                      <>
                        <button onClick={async () => {
                          try {
                            await axios.put(`/api/notice/${post._id}/comment/${c._id}`, { content: editContent }, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            const updated = [...comments];
                            updated[i].content = editContent;
                            setComments(updated);
                            setEditingIndex(null);
                            setEditContent('');
                          } catch {
                            alert('댓글 수정 실패');
                          }
                        }} className="text-green-600 text-sm">저장</button>
                        <button onClick={() => { setEditingIndex(null); setEditContent(''); }} className="text-gray-500 text-sm">취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingIndex(i); setEditContent(c.content); }} className="text-blue-600 text-sm">수정</button>
                        <button onClick={async () => {
                          try {
                            await axios.delete(`/api/notice/${post._id}/comment/${c._id}`, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            const updated = [...comments];
                            updated.splice(i, 1);
                            setComments(updated);
                          } catch {
                            alert('댓글 삭제 실패');
                          }
                        }} className="text-red-500 text-sm">삭제</button>
                      </>
                    )}
                  </div>
                )}

                {(c.replies || []).map((r, ri) => (
                  <div key={ri} className="ml-12 mt-2 p-2 bg-gray-100 rounded flex gap-3 items-start">
                    <img src={r.profileImage || '/default-profile.png'} alt="프로필" className="w-8 h-8 rounded-full object-cover border" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.writer?.nickname || r.writer}</div>
                      {editingReply?.commentIndex === i && editingReply?.replyIndex === ri ? (
                        <input
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                          className="w-full border px-2 py-1 text-sm rounded"
                        />
                      ) : (
                        <div className="text-sm">{r.content}</div>
                      )}
                      <div className="text-xs text-right text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                      {user.nickname === (r.writer?.nickname || r.writer) && (
                        <div className="flex gap-2 mt-1">
                          {editingReply?.commentIndex === i && editingReply?.replyIndex === ri ? (
                            <>
                              <button onClick={async () => {
                                try {
                                  await axios.put(`/api/notice/${post._id}/comment/${c._id}/reply/${r._id}`, { content: editReplyContent }, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                  });
                                  const updated = [...comments];
                                  updated[i].replies[ri].content = editReplyContent;
                                  setComments(updated);
                                  setEditingReply(null);
                                  setEditReplyContent('');
                                } catch {
                                  alert('답글 수정 실패');
                                }
                              }} className="text-green-600 text-sm">저장</button>
                              <button onClick={() => { setEditingReply(null); setEditReplyContent(''); }} className="text-gray-500 text-sm">취소</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingReply({ commentIndex: i, replyIndex: ri }); setEditReplyContent(r.content); }} className="text-blue-600 text-sm">수정</button>
                              <button onClick={async () => {
                                try {
                                  await axios.delete(`/api/notice/${post._id}/comment/${c._id}/reply/${r._id}`, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                  });
                                  const updated = [...comments];
                                  updated[i].replies.splice(ri, 1);
                                  setComments(updated);
                                } catch {
                                  alert('답글 삭제 실패');
                                }
                              }} className="text-red-500 text-sm">삭제</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {replyInputIndex === i && (
                  <div className="ml-12 mt-2 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 border px-2 py-1 text-sm rounded"
                      placeholder="답글 입력..."
                    />
                    <button
                      onClick={() => handleReplySubmit(c._id, i)}
                      className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                    >등록</button>
                  </div>
                )}
                <button
                  onClick={() => setReplyInputIndex(replyInputIndex === i ? null : i)}
                  className="text-sm text-blue-600 mt-1"
                >{replyInputIndex === i ? '취소' : '답글'}</button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글 입력..."
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >등록</button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
