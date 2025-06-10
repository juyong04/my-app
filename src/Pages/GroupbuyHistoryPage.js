// src/Pages/GroupbuyHistoryPage.js
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function GroupbuyHistoryPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchMyGroupbuyPosts = async () => {
      try {
        const q = query(
          collection(db, 'groupbuyParticipants'),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const postIds = snapshot.docs.map(doc => doc.data().postId);

        const fetchedPosts = await Promise.all(
          postIds.map(async (postId) => {
            const postRef = doc(db, 'groupbuys', postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
              return { id: postSnap.id, ...postSnap.data() };
            }
            return null;
          })
        );

        setPosts(fetchedPosts.filter(Boolean));
      } catch (err) {
        console.error('🔥 참여한 글 불러오기 실패:', err);
      }
    };

    fetchMyGroupbuyPosts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>참여한 공동구매 목록</h2>
      {posts.length === 0 ? (
        <p>참여한 글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map(post => (
            <li key={post.id} style={{ marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
              <strong>{post.title}</strong>
              <div>마감일: {post.deadline?.replace('T', ' ')}</div>
              <div>1인당 금액: {Math.floor(Number(post.totalPrice?.replace(/,/g, '')) / Number(post.goalPeople || 1)).toLocaleString()} 원</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupbuyHistoryPage;
