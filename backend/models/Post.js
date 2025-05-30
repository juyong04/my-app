// Mongoose 모듈을 불러옵니다 (MongoDB와 연동하기 위한 ODM 도구)
const mongoose = require('mongoose');

// 게시물(Post)의 데이터 구조를 정의하는 스키마(Schema)를 생성합니다
const PostSchema = new mongoose.Schema({
  // 게시물 제목: 문자열로 저장됩니다
  title: String,

  // 게시물 내용: 문자열로 저장됩니다
  content: String,

  // 게시물 생성일자: 날짜 형식으로 저장되며, 따로 입력하지 않으면 자동으로 현재 시간이 들어갑니다
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 정의한 스키마를 바탕으로 'Post'라는 이름의 모델을 생성하고 외부에서 사용할 수 있도록 내보냅니다
module.exports = mongoose.model('Post', PostSchema);