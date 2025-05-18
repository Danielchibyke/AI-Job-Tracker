import React, { useEffect, useState } from 'react';
import { logout } from '../api/auth.api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      } else {
        setError(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/users/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      {notifications.length === 0 ? (
        <div>No notifications yet.</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n._id} className={`p-4 rounded shadow ${n.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <div className="flex justify-between items-center">
                <span>{n.message}</span>
                {!n.isRead && (
                  <button
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => markAsRead(n._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications; 