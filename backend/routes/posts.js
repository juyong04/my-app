// backend/routes/posts.js

const express = require("express");
const router = express.Router();
const { db } = require("../firebase");  // Firebase Firestore 연결

// ✅ GET /api/posts → 게시글 목록 조회
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "게시글을 불러오지 못했습니다." });
  }
});

// ✅ POST /api/posts → 게시글 저장
router.post("/", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = {
      title,
      content,
      author,
      createdAt: new Date()
    };
    const docRef = await db.collection("posts").add(newPost);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: "게시글을 저장하지 못했습니다." });
  }
});

module.exports = router;