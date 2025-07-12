import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMoodBoards } from '../hooks/useMoodBoards';
import { useMood } from '../context/MoodContext.jsx';
import mirrorImg from '../assets/mirror_alter_ego.png';
import ghostImg from '../assets/black_ghost.png';

// UI Element Pop-up Emoji Component
const PopupEmoji = ({ emoji, x, y, delay, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        y: [0, -30, -60]
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none z-50"
      style={{ 
        left: x, 
        top: y,
        fontSize: '24px',
        filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'
      }}
    >
      {emoji}
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { boards, loading, error, createBoard, deleteBoard } = useMoodBoards();
  const { currentMood, setCurrentMood, moodList, moodHistory, getCurrentMoodFont, addMoodToHistory } = useMood();
  const [popupEmojis, setPopupEmojis] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mood: 'happy',
    items: [],
    isPublic: false
  });

  const dashboardRef = useRef(null);
  const { scrollY } = useScroll({ container: dashboardRef });
  
  // Awwards-style scroll animations
  const headerY = useTransform(scrollY, [0, 300], [0, -100]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const statsY = useTransform(scrollY, [0, 400], [0, -50]);
  const boardsY = useTransform(scrollY, [0, 500], [0, -30]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);

  // Generate popup emojis within UI elements
  useEffect(() => {
    const emojis = ['😊', '😢', '😠', '😨', '🤢', '😲'];
    
    const createPopupEmoji = () => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const id = Date.now() + Math.random();
      
      // Random position within the dashboard area
      const x = Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1);
      const y = Math.random() * (window.innerHeight * 0.7) + (window.innerHeight * 0.15);
      
      const newEmoji = {
        id,
        emoji,
        x,
        y,
        delay: 0
      };
      
      setPopupEmojis(prev => [...prev, newEmoji]);
      
      // Remove emoji after animation
      setTimeout(() => {
        setPopupEmojis(prev => prev.filter(e => e.id !== id));
      }, 1500);
    };

    // Create emojis at random intervals
    const interval = setInterval(createPopupEmoji, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Create emoji on hover for interactive elements
  const createHoverEmoji = (event, emoji = '✨') => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now() + Math.random();
    
    const newEmoji = {
      id,
      emoji,
      x: rect.left + x,
      y: rect.top + y,
      delay: 0
    };
    
    setPopupEmojis(prev => [...prev, newEmoji]);
    
    setTimeout(() => {
      setPopupEmojis(prev => prev.filter(e => e.id !== id));
    }, 1500);
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fear: '😨',
      disgust: '🤢',
      surprise: '😲'
    };
    return emojis[mood] || '😊';
  };

  const getMoodGradient = (mood) => {
    const gradients = {
      happy: 'from-yellow-400 via-orange-400 to-yellow-500',
      sad: 'from-blue-400 via-indigo-500 to-purple-500',
      angry: 'from-red-400 via-pink-500 to-red-500',
      fear: 'from-gray-400 via-gray-500 to-gray-600',
      disgust: 'from-green-400 via-teal-500 to-green-500',
      surprise: 'from-pink-400 via-purple-500 to-pink-500'
    };
    return gradients[mood] || 'from-yellow-400 via-orange-400 to-yellow-500';
  };

  const getMoodBgGradient = (mood) => {
    const gradients = {
      happy: 'from-yellow-50 via-orange-50 to-yellow-100',
      sad: 'from-blue-50 via-indigo-50 to-purple-100',
      angry: 'from-red-50 via-pink-50 to-red-100',
      fear: 'from-gray-50 via-gray-50 to-gray-100',
      disgust: 'from-green-50 via-teal-50 to-green-100',
      surprise: 'from-pink-50 via-purple-50 to-pink-100'
    };
    return gradients[mood] || 'from-yellow-50 via-orange-50 to-yellow-100';
  };

  const getMoodBorderColor = (mood) => {
    const colors = {
      happy: 'border-yellow-200',
      sad: 'border-blue-200',
      angry: 'border-red-200',
      fear: 'border-gray-200',
      disgust: 'border-green-200',
      surprise: 'border-pink-200'
    };
    return colors[mood] || 'border-yellow-200';
  };

  const getMoodShadowColor = (mood) => {
    const shadows = {
      happy: 'shadow-yellow-200/50',
      sad: 'shadow-blue-200/50',
      angry: 'shadow-red-200/50',
      fear: 'shadow-gray-200/50',
      disgust: 'shadow-green-200/50',
      surprise: 'shadow-pink-200/50'
    };
    return shadows[mood] || 'shadow-yellow-200/50';
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const newBoard = await createBoard(formData);
      
      if (newBoard && newBoard.mood) {
        addMoodToHistory(newBoard.mood, 0.8);
        setCurrentMood(newBoard.mood);
      }
      
      setFormData({ title: '', description: '', mood: 'happy', items: [], isPublic: false });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!boardId) {
      console.error('Board ID is undefined or null');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this mood board?')) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getMoodBgGradient(currentMood)} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-black text-gray-700 font-mango tracking-wider"
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getMoodBgGradient(currentMood)} flex items-center justify-center`}>
        <div className="text-red-600 text-2xl font-black font-mango">ERROR: {error}</div>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef} 
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${getMoodBgGradient(currentMood)} transition-all duration-1000`}
    >
      {/* Popup Emojis Overlay */}
      <AnimatePresence>
        {popupEmojis.map(emoji => (
          <PopupEmoji
            key={emoji.id}
            emoji={emoji.emoji}
            x={emoji.x}
            y={emoji.y}
            delay={emoji.delay}
          />
        ))}
      </AnimatePresence>

      {/* Subtle Gradient Orbs */}
      <motion.div 
        style={{ y: headerY, scale: headerScale, opacity }} 
        className={`absolute top-20 left-20 w-32 h-32 bg-gradient-to-r ${getMoodGradient(currentMood)} rounded-full blur-2xl z-0 opacity-20 transition-all duration-1000`} 
      />
      <motion.div 
        style={{ y: headerY, scale: headerScale, opacity }} 
        className={`absolute top-40 right-20 w-24 h-24 bg-gradient-to-r ${getMoodGradient(currentMood)} rounded-full blur-2xl z-0 opacity-20 transition-all duration-1000`} 
      />

      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        {/* Awwards-style Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.3 }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center mb-12">
            <motion.img 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring" }}
              src={mirrorImg}
              alt="Mirror Alter Ego" 
              className="w-20 h-20 mr-8 rounded-full object-cover shadow-2xl"
            />
            <motion.img 
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", delay: 0.2 }}
              src={ghostImg}
              alt="Black Ghost" 
              className="w-20 h-20 ml-8 rounded-full object-cover shadow-2xl"
            />
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-6xl sm:text-8xl md:text-9xl font-black text-gray-800 mb-8 font-mango tracking-tight leading-none"
          >
            WELCOME BACK,<br />
            <span className={`bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent`}>
              {user?.displayName?.split(' ')[0]?.toUpperCase() || 'FRIEND'}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-2xl sm:text-3xl text-gray-600 max-w-4xl mx-auto font-bold font-mango tracking-wide"
          >
            EXPRESS YOUR EMOTIONS THROUGH BEAUTIFUL MOOD BOARDS
          </motion.p>
        </motion.div>

        {/* Awwards-style Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ y: statsY }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-24"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            onHoverStart={(e) => createHoverEmoji(e, '📊')}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center border-2 border-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 relative"
          >
            <div className="text-5xl sm:text-6xl font-black text-gray-800 font-mango mb-4">{boards.length}</div>
            <div className="text-xl font-bold text-gray-600 font-mango tracking-wide">MOOD BOARDS</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            onHoverStart={(e) => createHoverEmoji(e, '📈')}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center border-2 border-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 relative"
          >
            <div className="text-5xl sm:text-6xl font-black text-gray-800 font-mango mb-4">{moodHistory.length}</div>
            <div className="text-xl font-bold text-gray-600 font-mango tracking-wide">MOOD ENTRIES</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            onHoverStart={(e) => createHoverEmoji(e, '🌍')}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center border-2 border-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 relative"
          >
            <div className="text-5xl sm:text-6xl font-black text-gray-800 font-mango mb-4">{boards.filter(b => b.isPublic).length}</div>
            <div className="text-xl font-bold text-gray-600 font-mango tracking-wide">PUBLIC BOARDS</div>
          </motion.div>
        </motion.div>

        {/* Awwards-style Mood Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center mb-24"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 border-2 border-gray-100 shadow-2xl relative">
            <h3 className="text-3xl font-black text-gray-800 mb-8 text-center font-mango tracking-wide">HOW ARE YOU FEELING?</h3>
            <div className="flex gap-4 flex-wrap justify-center">
              {moodList.map((mood) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.1, y: -8, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={(e) => createHoverEmoji(e, getMoodEmoji(mood))}
                  onClick={() => setCurrentMood(mood)}
                  className={`px-8 py-4 rounded-2xl text-lg font-black transition-all duration-300 font-mango tracking-wide relative ${
                    currentMood === mood
                      ? `bg-gradient-to-r ${getMoodGradient(mood)} text-white shadow-2xl scale-110`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <span className="text-2xl mr-2">{getMoodEmoji(mood)}</span>
                  {mood.toUpperCase()}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Awwards-style Create Board Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={(e) => createHoverEmoji(e, '✨')}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`bg-gradient-to-r ${getMoodGradient(currentMood)} text-white px-12 py-6 text-2xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 font-mango tracking-wide relative`}
          >
            {showCreateForm ? 'CANCEL' : '✨ CREATE NEW MOOD BOARD'}
          </motion.button>
        </motion.div>

        {/* Awwards-style Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="max-w-2xl mx-auto mb-24"
            >
              <form onSubmit={handleCreateBoard} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-2 border-gray-100 relative">
                <h3 className="text-3xl font-black text-gray-800 mb-8 text-center font-mango tracking-wide">CREATE YOUR MOOD BOARD</h3>
                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-700 font-black mb-4 font-mango text-lg tracking-wide">TITLE</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-transparent text-xl font-bold font-mango"
                      placeholder="MY HAPPY PLACE"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-black mb-4 font-mango text-lg tracking-wide">DESCRIPTION</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-transparent text-xl font-bold font-mango"
                      rows={4}
                      placeholder="WHAT'S ON YOUR MIND?"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-black mb-4 font-mango text-lg tracking-wide">INITIAL MOOD</label>
                    <select
                      value={formData.mood}
                      onChange={e => setFormData({ ...formData, mood: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-transparent text-xl font-bold font-mango"
                    >
                      {moodList.map(mood => (
                        <option key={mood} value={mood}>
                          {getMoodEmoji(mood)} {mood.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="h-6 w-6 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="text-gray-700 font-black font-mango text-lg tracking-wide">MAKE THIS BOARD PUBLIC</label>
                  </div>
                  <button 
                    type="submit" 
                    className={`w-full bg-gradient-to-r ${getMoodGradient(currentMood)} text-white py-6 px-8 rounded-2xl font-black text-xl hover:shadow-2xl transition-all duration-500 font-mango tracking-wide`}
                  >
                    CREATE BOARD
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Awwards-style Mood Boards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          style={{ y: boardsY }}
        >
          <h2 className={`text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-mango tracking-wide transition-all duration-1000`}>
            YOUR MOOD BOARDS ({boards.length})
          </h2>
          {boards.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <div className="text-9xl mb-8">🎭</div>
              <h3 className="text-4xl font-black text-gray-700 mb-6 font-mango tracking-wide">
                NO MOOD BOARDS YET
              </h3>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-bold font-mango tracking-wide">
                CREATE YOUR FIRST MOOD BOARD TO START EXPRESSING YOUR FEELINGS AND EMOTIONS!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boards.map((board, index) => (
                <motion.div
                  key={board._id || board.id || index}
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -15, rotate: 2 }}
                  onHoverStart={(e) => createHoverEmoji(e, getMoodEmoji(board.detectedEmotion || board.mood))}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 hover:shadow-3xl transition-all duration-500 relative"
                >
                  <div className={`h-3 bg-gradient-to-r ${getMoodGradient(board.detectedEmotion || board.mood)}`}></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-gray-800 font-mango tracking-wide">{board.title}</h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r ${getMoodGradient(board.detectedEmotion || board.mood)} text-white font-mango tracking-wide`}>
                          <span className="text-lg mr-2">{getMoodEmoji(board.detectedEmotion || board.mood)}</span>
                          {board.detectedEmotion || board.mood}
                        </span>
                        {board.isPublic && (
                          <span className="px-3 py-2 text-xs rounded-full bg-purple-500 text-white font-black font-mango tracking-wide">PUBLIC</span>
                        )}
                      </div>
                    </div>
                    {board.description && (
                      <p className="text-gray-600 mb-6 text-lg font-bold font-mango tracking-wide">{board.description}</p>
                    )}
                    {board.detectedEmotion && board.emotionConfidence && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                        <p className="text-sm text-blue-800 font-black font-mango tracking-wide">
                          <strong>AI DETECTED:</strong> {board.detectedEmotion} 
                          <span className="ml-2 text-blue-600">
                            ({(board.emotionConfidence * 100).toFixed(1)}% CONFIDENCE)
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 font-bold font-mango tracking-wide">
                      <span>{board.items && Array.isArray(board.items) ? board.items.length : 0} ITEMS</span>
                      <span>{board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'JUST NOW'}</span>
                    </div>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onHoverStart={(e) => createHoverEmoji(e, '🗑️')}
                        onClick={() => {
                          const boardId = board._id || board.id;
                          if (boardId) {
                            handleDeleteBoard(boardId);
                          } else {
                            console.error('No valid board ID found:', board);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl text-sm font-black transition-colors font-mango tracking-wide"
                      >
                        DELETE
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 
