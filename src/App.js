// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './Context/NotificationContext';
import GlobalNotification from './Components/GlobalNotification';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  setPersistence,
  signOut,
  inMemoryPersistence,
} from 'firebase/auth';
import { auth } from './firebase';

import BottomNav from './Layout/nav';
import FloatingButton from './Layout/FloatingButton';
import FloatingMenu from './Layout/FloatingMenu';

import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import MyPage from './Pages/MyPage';

import HomePage from './Pages/HomePage';
import GroupbuyPostPage from './Pages/GroupbuyPostPage';
import GroupbuyListPage from './Pages/GroupbuyListPage';
import GroupbuyDetailPage from './Pages/GroupbuyDetailPage';

import GroupdeliveryPostPage from './Pages/GroupdeliveryPostPage';
import GroupdeliveryListPage from './Pages/GroupdeliveryListPage';
import GroupdeliveryDetailPage from './Pages/GroupdeliveryDetailPage';
import ParticipationHistoryPage from './Pages/ParticipationHistoryPage';



function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authPage, setAuthPage] = useState('login');
  const [activePage, setActivePage] = useState('home');
  const [menuVisible, setMenuVisible] = useState(false);
  const [groupbuyPosts, setGroupbuyPosts] = useState([]);
  const [groupdeliveryPosts, setGroupdeliveryPosts] = useState([]);
  const [selectedGroupbuyPost, setSelectedGroupbuyPost] = useState(null);
  const [selectedGroupdeliveryPost, setSelectedGroupdeliveryPost] = useState(null);


  useEffect(() => {
    setPersistence(auth, inMemoryPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.approved) {
              setUser(currentUser);
            } else {
              setUser(null); // 승인 안된 유저는 무시
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoadingAuth(false);
      });
      return unsubscribe;
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const q1 = query(collection(db, 'groupbuys'), orderBy('createdAt', 'desc'));
    const unsub1 = onSnapshot(q1, (snapshot) => {
      setGroupbuyPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const q2 = query(collection(db, 'groupdeliveries'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(q2, (snapshot) => {
      setGroupdeliveryPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleFloatingClick = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuSelect = (type) => {
    if (type === 'groupbuy') setActivePage('groupbuy-post');
    if (type === 'groupdelivery') setActivePage('groupdelivery-post');
    setMenuVisible(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthPage('login');
  };

  const handleNavigate = (type, postId) => {
    if (type === 'delivery') {
      const fetchDeliveryPost = async () => {
        try {
          const postRef = doc(db, 'groupdeliveries', postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            setSelectedGroupdeliveryPost({ ...postSnap.data(), id: postSnap.id });
            setActivePage('groupdelivery-detail');
          }
        } catch (err) {
          console.error('공동배달 정보 불러오기 실패:', err);
        }
      };
      fetchDeliveryPost();
    } else {
      const fetchBuyPost = async () => {
        try {
          const postRef = doc(db, 'groupbuys', postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            setSelectedGroupbuyPost({ ...postSnap.data(), id: postSnap.id });
            setActivePage('groupbuy-detail');
          }
        } catch (err) {
          console.error('공동구매 정보 불러오기 실패:', err);
        }
      };
      fetchBuyPost();
    }
  };

  if (loadingAuth) {
    return <p style={{ padding: '20px' }}>🔐 로그인 상태 확인 중...</p>;
  }

  if (!user) {
    return authPage === 'login' ? (
      <LoginPage
        onLoginSuccess={() => setActivePage('home')}
        onMoveToSignUp={() => setAuthPage('signup')}
      />
    ) : (
      <SignUpPage onMoveToLogin={() => setAuthPage('login')} />
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <GlobalNotification onNavigate={handleNavigate} />
        <div className="App">
          {/* <button
            onClick={handleLogout}
            style={{
              position: 'fixed',
              top: 10,
              right: 10,
              zIndex: 1000,
              background: '#eee',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
            }}
          >
            로그아웃
          </button> */}

          <div className="content">
            {activePage === 'home' && (
              <HomePage
                groupbuyPosts={groupbuyPosts}
                groupdeliveryPosts={groupdeliveryPosts}
                onSelect={(post) => {
                  if (post.type === 'groupbuy') {
                    setSelectedGroupbuyPost(post);
                    setActivePage('groupbuy-detail');
                  } else if (post.type === 'groupdelivery') {
                    setSelectedGroupdeliveryPost(post);
                    setActivePage('groupdelivery-detail');
                  }
                }}
              />
            )}

            {activePage === 'groupbuy' && (
              <GroupbuyListPage
                posts={groupbuyPosts}
                onSelect={(post) => {
                  setSelectedGroupbuyPost(post);
                  setActivePage('groupbuy-detail');
                }}
              />
            )}

            {activePage === 'groupbuy-post' && (
              <GroupbuyPostPage goBack={() => setActivePage('groupbuy')} />
            )}

            {activePage === 'groupbuy-detail' && selectedGroupbuyPost && (
              <GroupbuyDetailPage
                post={selectedGroupbuyPost}
                goBack={() => setActivePage('groupbuy')}
              />
            )}

            {activePage === 'groupdelivery' && (
              <GroupdeliveryListPage
                posts={groupdeliveryPosts}
                onSelect={(post) => {
                  setSelectedGroupdeliveryPost(post);
                  setActivePage('groupdelivery-detail');
                }}
              />
            )}

            {activePage === 'groupdelivery-post' && (
              <GroupdeliveryPostPage goBack={() => setActivePage('groupdelivery')} />
            )}

            {activePage === 'groupdelivery-detail' && selectedGroupdeliveryPost && (
              <GroupdeliveryDetailPage
                post={selectedGroupdeliveryPost}
                goBack={() => setActivePage('groupdelivery')}
              />
            )}
            
            {activePage === 'history' && <ParticipationHistoryPage />}


            {activePage === 'mypage' && <MyPage />}
          </div>

          <FloatingMenu visible={menuVisible} onSelect={handleMenuSelect} />
          <FloatingButton onClick={handleFloatingClick} />
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
