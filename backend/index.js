const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/posts', postRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// 🔗 MongoDB Atlas 연결 (아래 URL에 본인의 계정 정보를 넣으세요)
mongoose.connect('mongodb+srv://juyong:juyong1234@cluster0.kw4zlag.mongodb.net/myapp?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error(err));

app.listen(5000, () => {
  console.log('🚀 서버 실행 중: http://localhost:5000');
});