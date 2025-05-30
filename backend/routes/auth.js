// Express 모듈을 불러옵니다
const express = require('express');

// 라우터 인스턴스를 생성합니다 (라우팅을 모듈로 분리할 수 있게 해줌)
const router = express.Router();

// 사용자 모델을 불러옵니다 (MongoDB에서 사용자 정보를 가져오거나 저장할 때 사용)
const User = require('../models/User');

// JWT(JSON Web Token)를 사용해 토큰을 생성하기 위한 모듈
const jwt = require('jsonwebtoken');


// ✅ [회원가입 API] POST /api/auth/register
router.post('/register', async (req, res) => {
  // 클라이언트 요청에서 username과 password를 추출
  const { username, password } = req.body;

  // 이미 존재하는 사용자 이름인지 확인
  const existing = await User.findOne({ username });

  // 중복된 사용자가 있으면 400 에러 응답
  if (existing) return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });

  // 새 사용자 객체 생성 (👉 실서비스에서는 비밀번호를 반드시 해시해야 함)
  const newUser = new User({ username, password });

  // 데이터베이스에 저장
  await newUser.save();

  // 성공 메시지 반환
  res.json({ message: '회원가입 완료' });
});


// ✅ [로그인 API] POST /api/auth/login
router.post('/login', async (req, res) => {
  // 클라이언트 요청에서 username과 password를 추출
  const { username, password } = req.body;

  // 해당 사용자가 데이터베이스에 존재하는지 확인
  const user = await User.findOne({ username });

  // 사용자 존재 여부와 비밀번호가 일치하는지 검사
  if (!user || user.password !== password) {
    // 실패 시 401 Unauthorized 응답
    return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
  }

  // JWT 토큰 생성 (🔐 'mysecretkey'는 실제로는 .env 같은 환경변수로 관리해야 함)
  const token = jwt.sign({ username }, 'mysecretkey');

  // 토큰을 JSON 형태로 응답
  res.json({ token });
});


// 위에서 정의한 라우터들을 외부에서 사용할 수 있도록 모듈로 내보냅니다
module.exports = router;