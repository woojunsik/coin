import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EconomyNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 뉴스 불러오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/economy-news');
        setNews(res.data);
      } catch (err) {
        console.error('뉴스 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">⏳ 경제 뉴스를 불러오는 중...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">📈 최신 경제 뉴스</h2>

      <div className="space-y-6">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 p-4 rounded hover:shadow transition"
          >
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(item.pubDate).toLocaleString()}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EconomyNews;
