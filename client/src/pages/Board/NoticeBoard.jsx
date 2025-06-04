import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const NoticeBoard = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    fetchPosts();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('user:', user);         // 👈 현재 로그인된 유저 정보
    console.log('isAdmin:', user?.isAdmin); // 👈 관리자 여부 확인
    
    if (user?.isAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/notice');
      setPosts(res.data);
    } catch (err) {
      console.error('공지사항 불러오기 실패:', err);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diff = Math.floor((now - created) / 1000 / 60);
    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return created.toISOString().slice(0, 10);
  };

  const getThumbnail = (post) => {
    const htmlImg = post.content?.match(/<img[^>]+src=['"]([^'"]+)['"]/);
    if (htmlImg) return htmlImg[1];
    const markdownImg = post.content?.match(/!\[.*?\]\((.*?)\)/);
    if (markdownImg) return markdownImg[1];
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
        <h2 className="text-2xl font-bold">📢 공지사항</h2>
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
          {isAdmin && (
            <Link
              to="/notice/write"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              글쓰기
            </Link>
          )}
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
                  <Link to={`/notice/${post._id}`} className="text-blue-600 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td>{writer}</td>
                <td>{formatDate(post.createdAt)}</td>
                <td>{post.views ?? 0}</td>
                <td>{post.likes ?? 0}</td>
              </tr>
            );
          })}

          {currentPosts.length === 0 && (
            <tr>
              <td colSpan="7" className="py-4 text-gray-500">
                등록된 공지사항이 없습니다.
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

export default NoticeBoard;
