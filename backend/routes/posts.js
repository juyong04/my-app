// Express 모듈을 불러옵니다
const express = require('express');

// 라우터 객체 생성 (라우트를 모듈로 분리하기 위해 사용)
const router = express.Router();

// 게시글(Post) 모델 불러오기 (MongoDB에 연결된 Mongoose 모델)
const Post = require('../models/Post');

// 글 목록을 가져오는 API (최신 글이 위에 오도록 정렬)
router.get('/', async (req, res) => {
  // MongoDB에서 모든 게시글을 가져오고, createdAt(생성일자) 기준으로 최신순 정렬
  const posts = await Post.find().sort({ createdAt: -1 });

  // 클라이언트에게 JSON 형식으로 응답
  res.json(posts);
});

// 새 글 작성하기
// 새 글을 작성하는 API
router.post('/', async (req, res) => {
  // 클라이언트에서 보낸 데이터를 바탕으로 새로운 Post 인스턴스 생성
  const newPost = new Post(req.body);

  // 데이터베이스에 저장
  await newPost.save();

  // 저장된 데이터를 클라이언트에게 반환
  res.json(newPost);
});

// 이 라우터 파일을 외부에서 사용할 수 있도록 내보냅니다
module.exports = router;