// utils/common.js
export function getLast4Digits(studentId) {
  if (!studentId || studentId.length < 4) return '';
  return studentId.slice(-4);
}
