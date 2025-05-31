const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const postRoutes = require("./routes/posts");  // ✅ posts 라우터 불러오기
app.use("/api/posts", postRoutes);             // ✅ 기본 경로 지정

app.listen(5000, () => {
  console.log("✅ 백엔드 서버 실행 중! http://localhost:5000");
});
