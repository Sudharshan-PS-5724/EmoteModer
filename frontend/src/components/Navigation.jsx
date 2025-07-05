import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMood } from '../context/MoodContext.jsx';

const moodNavStyles = {
  happy: 'bg-mood-happy-background/80 text-mood-happy-text',
  sad: 'bg-mood-sad-background/80 text-mood-sad-text',
  angry: 'bg-mood-angry-background/80 text-mood-angry-text',
  fear: 'bg-mood-fear-background/80 text-mood-fear-text',
  disgust: 'bg-mood-disgust-background/80 text-mood-disgust-text',
  surprise: 'bg-mood-surprise-background/80 text-mood-surprise-text',
};

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { currentMood } = useMood();
  const navClass = moodNavStyles[currentMood] || moodNavStyles.happy;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 80 }}
      className={`backdrop-blur-md shadow-lg border-b border-white/30 sticky top-0 z-50 transition-colors duration-500 ${navClass}`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/">
              <motion.h1
                whileHover={{ scale: 1.05 }}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-mood-happy-primary to-mood-happy-secondary bg-clip-text text-transparent"
              >
                Emote Moder
              </motion.h1>
            </Link>
          </div>

          {/* Hamburger menu for all screen sizes */}
          <div className="flex items-center">
            <button
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-mood-happy-primary"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* User section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                {/* User avatar with first letter */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-mood-happy-primary/20 text-mood-happy-text border border-mood-happy-primary">
                    {user.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.displayName}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="bg-gradient-to-r from-mood-happy-primary to-mood-happy-secondary hover:from-mood-happy-secondary hover:to-mood-happy-primary text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md"
                >
                  Logout
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav menu */}
        {menuOpen && (
          <div className="mt-2 pb-2">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-md text-base font-medium transition-colors mb-1 ${
                location.pathname === '/dashboard'
                  ? 'bg-mood-happy-primary/20 text-mood-happy-primary'
                  : 'hover:bg-mood-happy-primary/10 hover:text-mood-happy-primary'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/gallery"
              className={`block px-4 py-2 rounded-md text-base font-medium transition-colors mb-1 ${
                location.pathname === '/gallery'
                  ? 'bg-mood-happy-primary/20 text-mood-happy-primary'
                  : 'hover:bg-mood-happy-primary/10 hover:text-mood-happy-primary'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              🌏 Public Gallery
            </Link>
            <Link
              to="/chat"
              className={`block px-4 py-2 rounded-md text-base font-medium transition-colors mb-1 ${
                location.pathname === '/chat'
                  ? 'bg-mood-happy-primary/20 text-mood-happy-primary'
                  : 'hover:bg-mood-happy-primary/10 hover:text-mood-happy-primary'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              💬 Chat Rooms
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation; 