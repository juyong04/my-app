// src/Pages/MyPage.js
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import '../AuthForm.css';

function MyPage() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    studentId: '',
    accountNumber: '',
    password: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setFormData({
            displayName: data.displayName || '',
            studentId: data.studentId || '',
            accountNumber: data.accountNumber || '',
            password: ''
          });
        }
      } catch (error) {
        console.error('사용자 정보 불러오기 실패:', error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: formData.displayName,
        accountNumber: formData.accountNumber
      });

      if (formData.password) {
        await updatePassword(currentUser, formData.password);
      }

      setUserData((prev) => ({
        ...prev,
        displayName: formData.displayName,
        accountNumber: formData.accountNumber
      }));

      alert('정보가 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('수정 오류:', error);
      alert('수정 중 오류가 발생했습니다: ' + error.message);
    }
  };

  if (!userData) return <p className="mypage-container">📦 내 정보 불러오는 중...</p>;

  return (
    <div className="mypage-container">
      {isEditing ? (
        <div className="mypage-box">
          <div className="mypage-header">
            <h2>내 정보 수정</h2>
          </div>
          <label>이름: <input name="displayName" value={formData.displayName} onChange={handleChange} /></label>
          <label>학번: <input name="studentId" value={formData.studentId} readOnly disabled /></label>
          <label>계좌번호: <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} /></label>
          <label>새 비밀번호: <input name="password" type="password" value={formData.password} onChange={handleChange} /></label>
          <button className="auth-button" onClick={handleSave}>💾 저장</button>
        </div>
      ) : (
        <div className="mypage-box">
          <div className="mypage-header">
            <img className="profile-image" src="/profile.png" alt="profile" />
            <h3>{userData.displayName}</h3>
            <p className="student-id">({userData.studentId})</p>
          </div>
          <div className="info-list">
            <div className="info-item"><span>👤</span> 이름: {userData.displayName}</div>
            <div className="info-item"><span>🎓</span> 학번: {userData.studentId}</div>
            <div className="info-item"><span>🏦</span> 계좌번호: {userData.accountNumber || '미등록'}</div>
          </div>
          <button className="auth-button" onClick={() => setIsEditing(true)}>✏️ 수정</button>
        </div>
      )}
    </div>
  );
}

export default MyPage;
