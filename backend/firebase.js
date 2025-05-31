// backend/firebase.js

const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin-key.json");  // 비공개 키 불러오기

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore DB 인스턴스 생성
const db = admin.firestore();

// 다른 파일에서 사용 가능하도록 내보내기
module.exports = { db, admin };