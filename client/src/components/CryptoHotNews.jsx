import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CryptoHotNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/crypto-news');
        setNews(res.data.slice(0, 4)); // 상위 4개만 표시
      } catch (err) {
        console.error('코인 뉴스 불러오기 실패:', err);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-bold mb-3">🔥 코인 핫뉴스</h2>
      <div className="space-y-3">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline"
          >
            <div className="text-sm font-medium text-gray-800 line-clamp-2">
              {item.title}
            </div>
            <div className="text-xs text-gray-500">{new Date(item.pubDate).toLocaleDateString()}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CryptoHotNews;
