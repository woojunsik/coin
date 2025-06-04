const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();

const parser = new Parser();
const COIN_RSS = 'https://rss.etnews.com/Section901.xml';

router.get('/', async (req, res) => {
  try {
    const feed = await parser.parseURL(COIN_RSS);
    
    const news = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      summary: item.contentSnippet,
    }));

    res.json(news);
  } catch (err) {
    console.error('코인데스크 뉴스 로딩 실패:', err.message);
    res.status(500).json({ message: '뉴스 로딩 오류' });
  }
});

module.exports = router;
