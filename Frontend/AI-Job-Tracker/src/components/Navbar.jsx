import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { logout } from '../api/auth.api';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let interval;
    const fetchUnread = async () => {
      if (!user) return setUnreadCount(0);
      try {
        const res = await fetch('/api/users/notifications/unread/count', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch avatar when user logs in
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }
      try {
        const res = await fetch('/api/users/profile/avatar', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const blob = await res.blob();
          setAvatarUrl(URL.createObjectURL(blob));
        } else {
          setAvatarUrl(null);
        }
      } catch {
        setAvatarUrl(null);
      }
    };
    fetchAvatar();
  }, [user]);

  return (
    <nav className="w-full bg-white shadow py-4 px-4 sm:px-8 flex items-center justify-between fixed top-0 left-0 z-50">
      <div className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => navigate('/')}>AI Job Tracker</div>
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden text-blue-700 focus:outline-none ml-2"
        onClick={() => setMenuOpen(m => !m)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      {/* Nav links */}
      <div className={`flex-col sm:flex-row sm:flex items-center gap-4 absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent shadow sm:shadow-none transition-all duration-200 ${menuOpen ? 'flex' : 'hidden sm:flex'}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="group flex items-center gap-1 text-blue-700 font-medium relative py-2 px-4 sm:p-0" onClick={() => setMenuOpen(false)}>
              <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                {/* Dashboard icon */}
                <svg className="w-5 h-5 mr-1 text-blue-500 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" /></svg>
              </motion.span>
              <span className="group-hover:underline transition">Dashboard</span>
            </Link>
            <Link to="/notifications" className="group flex items-center gap-1 text-blue-700 font-medium relative py-2 px-4 sm:p-0" onClick={() => setMenuOpen(false)}>
              <motion.span whileHover={{ rotate: 20 }} className="inline-block">
                {/* Bell icon */}
                <svg className="w-5 h-5 mr-1 text-blue-500 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </motion.span>
              <span className="group-hover:underline transition">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/automation-monitor" className="group flex items-center gap-1 text-blue-700 font-medium py-2 px-4 sm:p-0" onClick={() => setMenuOpen(false)}>
              <motion.span whileHover={{ rotate: -20 }} className="inline-block">
                {/* Automation icon */}
                <svg className="w-5 h-5 mr-1 text-blue-500 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L8 21m7.5-4l1.75 4M12 3v4m0 0a4 4 0 014 4v1a4 4 0 01-4 4 4 4 0 01-4-4V7a4 4 0 014-4zm0 0V3" /></svg>
              </motion.span>
              <span className="group-hover:underline transition">Automation</span>
            </Link>
            {/* Profile avatar as clickable link */}
            <Link to="/profile" className="flex items-center py-2 px-4 sm:p-0" title="Profile" onClick={() => setMenuOpen(false)}>
              <motion.img
                whileHover={{ scale: 1.15, rotate: 8 }}
                src={avatarUrl || '/default-avatar.png'}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-blue-300 hover:ring-2 hover:ring-blue-400 transition-all"
              />
            </Link>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors font-medium w-full sm:w-auto"
              onClick={() => { setMenuOpen(false); logout(); }}
            >
              {/* Logout icon */}
              <svg className="w-5 h-5 mr-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
              Logout
            </motion.button>
          </>
        ) : (
          <>
            <Link to="/login" className="group flex items-center gap-1 text-blue-700 font-medium py-2 px-4 sm:p-0" onClick={() => setMenuOpen(false)}>
              <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                {/* Login icon */}
                <svg className="w-5 h-5 mr-1 text-blue-500 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" /></svg>
              </motion.span>
              <span className="group-hover:underline transition">Login</span>
            </Link>
            <Link to="/signup" className="group flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-medium w-full sm:w-auto" onClick={() => setMenuOpen(false)}>
              <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                {/* Signup icon */}
                <svg className="w-5 h-5 mr-1 text-white group-hover:text-blue-200 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </motion.span>
              <span className="group-hover:underline transition">Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 