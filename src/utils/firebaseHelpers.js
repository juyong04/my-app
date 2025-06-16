// utils/firebaseHelpers.js
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function hasAlreadyReviewed(post, reviewerId, reviewTargetId) {
  const reviewPath =
    post.type === '구매'
      ? `groupbuys/${post.id}/reviews`
      : `groupdeliveries/${post.id}/reviews`;
  const reviewsRef = collection(db, reviewPath);
  const q = query(
    reviewsRef,
    where('reviewerId', '==', reviewerId),
    where('reviewTargetId', '==', reviewTargetId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function hasAlreadyReported(post, reporterId, reportedUserId) {
  const reportPath =
    post.type === '구매'
      ? `groupbuys/${post.id}/reports`
      : `groupdeliveries/${post.id}/reports`;
  const reportsRef = collection(db, reportPath);
  const q = query(
    reportsRef,
    where('reporterId', '==', reporterId),
    where('reportedUserId', '==', reportedUserId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function fetchParticipantsWithUserInfo(post) {
  const collectionName = post.type === '구매'
    ? 'groupbuyParticipants'
    : 'groupdeliveryParticipants';
  const q = query(collection(db, collectionName), where('postId', '==', post.id));
  const snap = await getDocs(q);
  const participants = await Promise.all(
    snap.docs.map(async docSnap => {
      const participant = { id: docSnap.id, ...docSnap.data() };
      const userSnap = await getDoc(doc(db, 'users', participant.userId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          ...participant,
          displayName: userData.displayName,
          studentId: userData.studentId,
          userId: participant.userId,
        };
      }
      return participant;
    })
  );
  return participants;
}