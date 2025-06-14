// src/Pages/SignUpPage.js
import { useState } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../AuthForm.css';

function SignUpPage({ onMoveToLogin }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
   // ✅ 사진 시늉용 상태 추가
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 브라우저용 미리보기 URL
    }
  };

  const handleSignUp = async () => {
    if (!studentId || !password || !displayName) {
      alert('이름, 학번, 비밀번호는 필수입니다.');
      return;
    }

    const email = `${studentId}@school.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        studentId,
        displayName,
        email,
        accountNumber,
        approved: false,
        createdAt: new Date(),
      });

      await signOut(auth);
      setShowSuccess(true);  // ✅ 성공 화면 표시

    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 실패: ' + error.message);
    }
  };

  if (showSuccess) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">✅ 요청 완료</h2>
        <p className="auth-subtext">회원가입 요청이 접수되었습니다.<br />관리자 승인 후 로그인해주세요.</p>
        <button className="auth-button" onClick={onMoveToLogin}>로그인 하러 가기</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">회원가입</h2>

      <input
        className="auth-input"
        type="text"
        placeholder="이름"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
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
        placeholder="비밀번호 (6자 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="auth-input"
        type="text"
        placeholder="계좌번호 (선택)"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />
       {/* ✅ 사진 파일 첨부 */}
      <label className="auth-subtext">학생증 사진 첨부 (선택)</label>
      <input
        className="auth-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {/* ✅ 사진 미리보기 */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="첨부된 사진 미리보기"
          style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
        />
      )}


      <button className="auth-button" onClick={handleSignUp}>회원가입 요청</button>

      <div className="auth-link">
        <span>이미 계정이 있나요? </span>
        <button onClick={onMoveToLogin}>로그인</button>
      </div>
    </div>
  );
}

export default SignUpPage;
