// BoardDetail.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import FollowButton from '@/components/FollowButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import LikeTooltip from '@/components/LikeTooltip';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const formatRelativeTime = (date) => {
  const diff = dayjs().to(dayjs(date));
  return diff;
};

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const tooltipTimerRef = useRef(null);
  const commentTooltipTimers = useRef({});
  const likeAnimatingRef = useRef(false);
  const likeDeltaRef = useRef(0);

  const [commentLikeAnimating, setCommentLikeAnimating] = useState({});
  const [commentLikeDelta, setCommentLikeDelta] = useState({});
  const [postTooltipVisible, setPostTooltipVisible] = useState(false);
  const [commentTooltipVisible, setCommentTooltipVisible] = useState({});

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`/api/board/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPost(res.data);
      setComments((res.data.comments || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      alert('게시글을 불러올 수 없습니다.');
      navigate('/board');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPost();
    return () => {
      clearTimeout(tooltipTimerRef.current);
      Object.values(commentTooltipTimers.current).forEach(clearTimeout);
    };
  }, [fetchPost]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`/api/board/${id}/comment`, { content: commentText }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch {
      alert('댓글 등록 실패');
    }
  };

  const handleLikeToggle = async () => {
    likeAnimatingRef.current = true;
    try {
      const res = await axios.post(`/api/board/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPost(prev => ({ ...prev, likes: res.data.likes, liked: res.data.liked }));
      likeDeltaRef.current = res.data.liked ? 1 : -1;
    } catch (err) {
      alert(err.response?.data?.message || '좋아요 처리 실패');
    }
  };

  const handlePostTooltipEnter = () => {
    clearTimeout(tooltipTimerRef.current);
    setPostTooltipVisible(true);
  };

  const handlePostTooltipLeave = () => {
    tooltipTimerRef.current = setTimeout(() => setPostTooltipVisible(false), 300);
  };

  const handleCommentLike = async (commentId) => {
    setCommentLikeAnimating(prev => ({ ...prev, [commentId]: true }));
    try {
      const res = await axios.post(`/api/board/${id}/comment/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, likes: res.data.likes, liked: res.data.liked } : c));
      setCommentLikeDelta(prev => ({ ...prev, [commentId]: res.data.liked ? 1 : -1 }));
    } catch (err) {
      alert(err.response?.data?.message || '댓글 좋아요 실패');
    } finally {
      setTimeout(() => {
        setCommentLikeAnimating(prev => ({ ...prev, [commentId]: false }));
      }, 300);
    }
  };

  const handleCommentTooltipToggle = (commentId, show) => {
    if (show) {
      clearTimeout(commentTooltipTimers.current[commentId]);
      setCommentTooltipVisible(prev => ({ ...prev, [commentId]: true }));
    } else {
      commentTooltipTimers.current[commentId] = setTimeout(() => {
        setCommentTooltipVisible(prev => ({ ...prev, [commentId]: false }));
      }, 300);
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ 게시글 불러오는 중...</p>;
  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-lg shadow">
      <div className="text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/board')} className="flex items-center gap-1 hover:underline">
          <FiArrowLeft /> 목록으로
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Link to={`/user/${post.writer?.nickname}`}>
          <img src={post.writer?.profile || '/default-profile.png'} alt="프로필" className="w-12 h-12 rounded-full object-cover border" />
        </Link>
        <div className="flex-1">
          <Link to={`/user/${post.writer?.nickname}`} className="text-sm font-semibold hover:underline">
            {post.writer?.nickname}
          </Link>
          <div className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</div>
        </div>
        {post.writer?._id && <FollowButton targetId={post.writer._id} />}
      </div>

      <h1 className="text-2xl font-bold mb-6">{post.title}</h1>

      <div className="prose max-w-none">
        <Viewer initialValue={post.content} />
      </div>

      <div className="flex justify-end items-center gap-6 mt-8 text-gray-500 text-sm">
        <button
          id="like-button"
          onMouseEnter={handlePostTooltipEnter}
          onMouseLeave={handlePostTooltipLeave}
          onClick={handleLikeToggle}
          className="relative flex items-center gap-1 group hover:opacity-80"
        >
          {post.liked ? (
            <>
              <AiFillHeart className="text-red-500" size={18} />
              {likeDeltaRef.current !== 0 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-500 text-xs animate-bounce">
                  {likeDeltaRef.current > 0 ? '+1' : '-1'}
                </span>
              )}
              {post.likedUserDetails?.length > 0 && <LikeTooltip users={post.likedUserDetails} show={postTooltipVisible} />}
            </>
          ) : <AiOutlineHeart size={18} />}
          {post.likes || 0}
        </button>

        <div className="flex items-center gap-1">💬 {comments.length}</div>
        <div className="flex items-center gap-1">👁 {post.views || 0}</div>
      </div>

      <div className="mt-10">
        <div className="flex items-center border rounded-full px-4 py-2 shadow-sm">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="감사와 도전적인 감정부터, 댓글을 입력해주세요."
            className="flex-1 text-sm outline-none"
          />
          <button onClick={handleCommentSubmit} className="ml-2 text-blue-500 hover:text-blue-600">
            <FiSend size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {comments.map(c => (
            <div key={c._id} className="flex items-start gap-3">
              <Link to={`/user/${c.writer?.nickname}`}>
                <img src={c.writer?.profile || '/default-profile.png'} alt="프로필" className="w-8 h-8 rounded-full object-cover border" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/user/${c.writer?.nickname}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {c.writer?.nickname}
                  </Link>
                  <span className="text-xs text-gray-400">{formatRelativeTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-800 mt-1">{c.content}</p>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                  <button
                    onMouseEnter={() => handleCommentTooltipToggle(c._id, true)}
                    onMouseLeave={() => handleCommentTooltipToggle(c._id, false)}
                    onClick={() => handleCommentLike(c._id)}
                    className={`relative flex items-center gap-1 group hover:text-red-500 transition-transform duration-200 ${commentLikeAnimating[c._id] ? 'scale-125' : 'scale-100'}`}
                  >
                    {c.liked ? (
                      <>
                        <AiFillHeart size={14} className="text-red-500" />
                        {commentLikeAnimating[c._id] && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-red-500 text-[10px] animate-bounce">
                            {commentLikeDelta[c._id] > 0 ? '+1' : '-1'}
                          </span>
                        )}
                        {c.likedUserDetails?.length > 0 && (
                          <LikeTooltip users={c.likedUserDetails} show={commentTooltipVisible[c._id]} />
                        )}
                      </>
                    ) : (
                      <AiOutlineHeart size={14} />
                    )}
                    {c.likes || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
