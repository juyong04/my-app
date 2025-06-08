import React, { useState, useEffect } from 'react';
import './App.css';

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

import BottomNav from './Layout/nav';
import FloatingButton from './Layout/FloatingButton';
import FloatingMenu from './Layout/FloatingMenu';

import HomePage from './Pages/HomePage';

import GroupbuyPostPage from './Pages/GroupbuyPostPage';
import GroupbuyListPage from './Pages/GroupbuyListPage';
import GroupbuyDetailPage from './Pages/GroupbuyDetailPage';

import GroupdeliveryPostPage from './Pages/GroupdeliveryPostPage';
import GroupdeliveryListPage from './Pages/GroupdeliveryListPage';
import GroupdeliveryDetailPage from './Pages/GroupdeliveryDetailPage';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [menuVisible, setMenuVisible] = useState(false);

  const [groupbuyPosts, setGroupbuyPosts] = useState([]);
  const [groupdeliveryPosts, setGroupdeliveryPosts] = useState([]);

  const [selectedGroupbuyPost, setSelectedGroupbuyPost] = useState(null);
  const [selectedGroupdeliveryPost, setSelectedGroupdeliveryPost] = useState(null);

  useEffect(() => {
    const q1 = query(collection(db, 'groupbuys'), orderBy('createdAt', 'desc'));
    const unsub1 = onSnapshot(q1, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroupbuyPosts(posts);
    });

    const q2 = query(collection(db, 'groupdeliveries'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(q2, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroupdeliveryPosts(posts);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleFloatingClick = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuSelect = (type) => {
    if (type === 'groupbuy') setActivePage('groupbuy-post');
    if (type === 'groupdelivery') setActivePage('groupdelivery-post');
    setMenuVisible(false);
  };

  return (
    <div className="App">
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


        {/* 공동구매 */}
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

        {/* 공동배달 */}
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
      </div>

      <FloatingMenu visible={menuVisible} onSelect={handleMenuSelect} />
      <FloatingButton onClick={handleFloatingClick} />
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

export default App;
