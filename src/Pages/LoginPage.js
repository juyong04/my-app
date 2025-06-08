// src/Pages/LoginPage.js
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../AuthForm.css';

function LoginPage({ onLoginSuccess, onMoveToSignUp }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = async () => {
    const email = `${studentId}@school.com`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists() && userDoc.data().approved) {
        setLoginStatus('✅ 로그인 성공!');
        onLoginSuccess(); // App.js에서 home으로 넘김
      } else {
        setLoginStatus('❌ 관리자 승인 대기 중입니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginStatus('❌ 로그인 실패. 학번 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">로그인</h2>

      <input
        className="auth-input"
        type="text"
        placeholder="학번"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-button" onClick={handleLogin}>로그인</button>
      <p className="auth-subtext">{loginStatus}</p>

      <div className="auth-link">
        <span>아직 계정이 없나요? </span>
        <button onClick={onMoveToSignUp}>회원가입</button>
      </div>
    </div>
  );
}

export default LoginPage;
