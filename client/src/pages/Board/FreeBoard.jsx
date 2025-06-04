import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// dayjs.updateLocale은 ESM 환경에서만 동작하므로 사용자 지정 포맷은 직접 처리합니다
const formatRelativeTime = (date) => {
  const diffInSeconds = dayjs().diff(dayjs(date), 'second');
  const diffInMinutes = dayjs().diff(dayjs(date), 'minute');
  const diffInHours = dayjs().diff(dayjs(date), 'hour');
  const diffInDays = dayjs().diff(dayjs(date), 'day');
  const diffInMonths = dayjs().diff(dayjs(date), 'month');
  const diffInYears = dayjs().diff(dayjs(date), 'year');

  if (diffInSeconds < 60) return '방금';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 30) return `${diffInDays}일 전`;
  if (diffInMonths < 12) return `${diffInMonths}개월 전`;
  return `${diffInYears}년 전`;
};



const FreeBoard = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/board');
      setPosts(res.data);
    } catch (err) {
      console.error('게시글 불러오기 실패:', err);
    }
  };

  const getThumbnail = (post) => {
    const htmlImg = post.content?.match(/<img[^>]+src=['"]([^'"]+)['"]/);
    if (htmlImg) return htmlImg[1];
    const markdownImg = post.content?.match(/!\[.*?\]\((.*?)\)/);
    if (markdownImg) return markdownImg[1];
    if (post.fileUrl) return post.fileUrl;
    if (post.image && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(post.image)) return post.image;
    return null;
  };

  const filteredPosts = posts
    .filter((post) => {
      const writer = typeof post.writer === 'object' ? post.writer.nickname || post.writer.id : post.writer;
      return (
        post.title.includes(search) ||
        post.content.includes(search) ||
        writer.includes(search)
      );
    })
    .sort((a, b) => {
      if (sort === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'views') return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">📝 자유게시판</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="검색어 입력"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="latest">최신순</option>
            <option value="views">조회순</option>
            <option value="likes">좋아요순</option>
          </select>
          <Link
            to="/board/write"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <table className="w-full text-sm text-center border-t">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="py-2">번호</th>
            <th>썸네일</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>좋아요</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post, idx) => {
            const thumb = getThumbnail(post);
            const writer = typeof post.writer === 'object' ? post.writer.nickname || post.writer.id : post.writer;

            return (
              <tr key={post._id} className="border-b hover:bg-gray-50">
                <td className="py-1">{filteredPosts.length - (indexOfFirstPost + idx)}</td>
                <td className="py-1">
                  {thumb ? (
                    <img src={thumb} alt="썸네일" className="w-12 h-12 object-cover rounded mx-auto" />
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <Link to={`/board/${post._id}`} className="text-blue-600 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td>
                  <Link to={`/user/${writer}`} className="text-blue-600 hover:underline">
                    {writer}
                  </Link>
                </td>
                <td>{formatRelativeTime(post.createdAt)}</td>
                <td>{post.views ?? 0}</td>
                <td>{post.likes ?? 0}</td>
              </tr>
            );
          })}

          {currentPosts.length === 0 && (
            <tr>
              <td colSpan="7" className="py-4 text-gray-500">
                검색된 게시글이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-2 justify-center mt-6">
        {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FreeBoard;
