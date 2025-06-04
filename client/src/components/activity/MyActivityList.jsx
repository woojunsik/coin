import { useEffect, useState } from 'react';
import axios from 'axios';

const MyActivityList = ({ userId, type = 'written' }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      try {
        const boardRes = await axios.get('/api/board');

        if (type === 'written') {
          const posts = boardRes.data.filter(post => {
            const writerId = typeof post.writer === 'object' ? post.writer._id : post.writer;
            return String(writerId) === String(userId);
          });
          setList(posts);
        }

        if (type === 'comments') {
          const comments = [];
          for (const post of boardRes.data) {
            const full = await axios.get(`/api/board/${post._id}`);
            (full.data.comments || []).forEach(c => {
              const writerId = typeof c.writer === 'object' ? c.writer._id : c.writer;
              if (String(writerId) === String(userId)) {
                comments.push({
                  content: c.content,
                  createdAt: c.createdAt,
                  postId: post._id,
                  postTitle: post.title,
                });
              }
            });
          }
          setList(comments);
        }

        if (type === 'liked') {
          const likedRes = await axios.get(`/api/board/liked/${userId}`);
          setList(likedRes.data);
        }
      } catch (err) {
        console.error(`${type} 불러오기 실패`, err);
      }
    };

    fetch();
  }, [type, userId]);

  if (!list.length) return <p className="text-sm text-gray-500">데이터가 없습니다.</p>;

  return (
    <div className="mt-2 mb-2 space-y-2 text-sm">
      {type === 'comments'
        ? list.map((c, idx) => (
            <div
              key={`${c.postId}-${c.createdAt}-${idx}`}
              className="bg-white border rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
                  댓글
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{c.content}</p>
              <a
                href={`/board/${c.postId}`}
                className="text-xs text-blue-600 hover:underline"
              >
                제목: {c.postTitle}
              </a>
            </div>
          ))
        : list.map((post, idx) => (
            <div
              key={`${post._id || post.id || post.postId}-${idx}`}
              className="bg-white border rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                  {type === 'liked' ? '좋아요' : '게시글'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
  <a
    href={`/board/${post._id}`}
    className="font-semibold text-gray-800 hover:underline"
  >
    {post.title}
  </a>
  <div className="flex gap-2 text-xs text-gray-500">
    <span>❤️ {post.likes || 0}</span>
    <span>💬 {post.comments?.length || 0}</span>
  </div>
</div>

              {post.content && (
  <div
    className="text-xs text-gray-600 mt-0 line-clamp-2"
    dangerouslySetInnerHTML={{ __html: post.content }}
  ></div>
)}

            </div>
          ))}
    </div>
  );
};

export default MyActivityList;
