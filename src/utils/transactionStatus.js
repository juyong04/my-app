export const getStatus = async (post) => {
  const now = new Date();
  const deadline = post.deadline.toDate();
  const meetTime = post.meetTime.toDate();

  const isOngoing = now < deadline;
  const isClosed = now >= deadline && now < meetTime;
  const isCompleted = now >= meetTime;
  
  const canCancel = isOngoing && 
    (deadline - now) > 24 * 60 * 60 * 1000;

  return { isOngoing, isClosed, isCompleted, canCancel };
};
