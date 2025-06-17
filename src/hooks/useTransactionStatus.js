import { useEffect, useState } from 'react';
import { getStatus } from '../utils/transactionStatus';

export default function useTransactionStatus(post) {
  const [status, setStatus] = useState({
    isOngoing: false,
    isClosed: false,
    isCompleted: false,
    canCancel: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      const newStatus = await getStatus(post);
      setStatus(newStatus);
    };
    checkStatus();
  }, [post]);

  return status;
}
