// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCdU9diu0KoypYD0EerFU5INPvhdsZNKa0',
  authDomain: 'ordermate-e0763.firebaseapp.com',
  projectId: 'ordermate-e0763',
  storageBucket: 'ordermate-e0763.appspot.com',
  messagingSenderId: '496844515769',
  appId: '1:496844515769:web:7a0bc64960da8dcd57ee68',
  measurementId: 'G-YCY623HMM6',
};

// ✅ Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ auth 먼저 생성
export const auth = getAuth(app);

// ✅ 로그인 세션 브라우저 새로고침 시 초기화 (자동 로그인 방지)
setPersistence(auth, inMemoryPersistence)
  .catch((error) => {
    console.error('🔥 로그인 유지 설정 실패:', error);
  });
