export const getInitialReviewForm = () => ({
  timeRating: 0,
  priceRating: 0,
  placeRating: 0,
  comment: '',
});
export const getInitialReviewModal = () => ({
  open: false,
  post: null,
  hostInfo: null,
  participants: [],
  selectedParticipant: null,
});
export const getInitialReportForm = () => ({
  reason: '',
  comment: '',
});
export const getInitialReportModal = () => ({
  open: false,
  post: null,
  hostInfo: null,
  participants: [],
  selectedParticipant: null,
});
export const getInitialEvalModal = () => ({
  open: false,
  comments: [],
  loading: false,
  post: null,
});
export const calculateAverage = reviews => {
  if (!reviews.length) return 0;
  const total = reviews.reduce(
    (acc, cur) =>
      acc +
      ((cur.timeRating || 0) +
        (cur.priceRating || 0) +
        (cur.placeRating || 0)) / 3,
    0
  );
  return total / reviews.length;
};
export const getStatus = post => {
  const now = new Date();
  const deadline = new Date(post.deadline);
  const timeDiff = deadline - now;
  const canCancel = timeDiff > 24 * 60 * 60 * 1000; // 24시간 전까지 취소 가능
  const isClosed = now > deadline;
  const isCompleted = post.isCompleted || false;
  return { canCancel, isClosed, isCompleted, deadline };
};