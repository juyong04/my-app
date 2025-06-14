import React, { useState, useEffect } from 'react';
import { useNotifications } from '../Context/NotificationContext';
import DeadlinePopup from './DeadlinePopup';

function GlobalNotification({ onNavigate = () => {} }) {
  const { notifications } = useNotifications();
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications]);

  const handleClose = () => {
    setCurrentNotification(null);
  };

  if (!currentNotification) return null;

  return (
    <DeadlinePopup
      isOpen={true}
      onClose={handleClose}
      meetTime={currentNotification.meetTime?.replace('T', ' ')}
      title={currentNotification.title}
      postId={currentNotification.id}
      type={currentNotification.type}
      onNavigate={onNavigate}
      isHost={currentNotification.isHost}
    />
  );
}

export default GlobalNotification;