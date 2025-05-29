const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 회원가입
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });

  const newUser = new User({ username, password }); // 비밀번호 암호화는 실서비스에서는 필수!
  await newUser.save();
  res.json({ message: '회원가입 완료' });
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
  }

  const token = jwt.sign({ username }, 'mysecretkey'); // 👈 실제 서비스에서는 환경변수로 분리
  res.json({ token });
});

module.exports = router;