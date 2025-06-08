// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCdU9diu0KoypYD0EerFU5INPvhdsZNKa0',
  authDomain: 'ordermate-e0763.firebaseapp.com',
  projectId: 'ordermate-e0763',
  storageBucket: 'ordermate-e0763.appspot.com',
  messagingSenderId: '496844515769',
  appId: '1:496844515769:web:7a0bc64960da8dcd57ee68',
  measurementId: 'G-YCY623HMM6'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
