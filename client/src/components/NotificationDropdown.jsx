import React, { useEffect, useState } from 'react';
import socket from '@/socket';
import { useUser } from '@/pages/context/UserContext';

const NotificationDropdown = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit('join', user._id); // 방 참여

    socket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-xl">
        🔔
        {notifications.length > 0 && (
          <span className="ml-1 px-1 bg-red-500 text-white rounded text-xs">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded text-sm z-50">
          {notifications.length === 0 ? (
            <div className="p-3 text-gray-500">알림 없음</div>
          ) : (
            notifications.map((n, idx) => (
              <div key={idx} className="p-3 border-b last:border-none">
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
