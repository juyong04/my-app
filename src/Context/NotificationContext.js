import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const checkDeadlines = () => {
      const now = new Date();
      
      // 공동배달 마감 체크
      const deliveryQuery = query(
        collection(db, 'groupdeliveryParticipants'),
        where('userId', '==', auth.currentUser.uid)
      );

      const deliveryUnsubscribe = onSnapshot(deliveryQuery, async (snapshot) => {
        const deliveryPosts = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const postRef = doc(db, 'groupdeliveries', docSnapshot.data().postId);
            const postSnap = await getDoc(postRef);
            return { ...postSnap.data(), id: postSnap.id, type: 'delivery' };
          })
        );

        const deliveryNotifications = deliveryPosts
          .filter(post => {
            const deadline = new Date(post.deadline);
            return now >= deadline && now < new Date(deadline.getTime() + 2 * 1000);
          })
          .map(post => ({
            id: post.id,
            title: post.title,
            meetTime: post.meetTime,
            type: 'delivery'
          }));

        // 공동구매 마감 체크
        const buyQuery = query(
          collection(db, 'groupbuyParticipants'),
          where('userId', '==', auth.currentUser.uid)
        );

        const buyUnsubscribe = onSnapshot(buyQuery, async (snapshot) => {
          const buyPosts = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const postRef = doc(db, 'groupbuys', docSnapshot.data().postId);
              const postSnap = await getDoc(postRef);
              return { ...postSnap.data(), id: postSnap.id, type: 'buy' };
            })
          );

          const buyNotifications = buyPosts
            .filter(post => {
              const deadline = new Date(post.deadline);
              return now >= deadline && now < new Date(deadline.getTime() + 2 * 1000);
            })
            .map(post => ({
              id: post.id,
              title: post.title,
              meetTime: post.meetTime,
              type: 'buy'
            }));

          setNotifications([...deliveryNotifications, ...buyNotifications]);
        });

        return () => {
          deliveryUnsubscribe();
          buyUnsubscribe();
        };
      });
    };

    const interval = setInterval(checkDeadlines, 1000); // 1분마다 체크
    checkDeadlines(); // 초기 체크

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
} 