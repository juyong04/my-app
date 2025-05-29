const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// 글 목록 불러오기
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// 새 글 작성하기
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json(newPost);
});

module.exports = router;