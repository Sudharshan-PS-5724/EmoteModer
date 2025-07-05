import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMoodBoards } from '../hooks/useMoodBoards';
import { useMood } from '../context/MoodContext.jsx';

// Floating Emoji Particle Component
const FloatingEmoji = ({ emoji, delay, duration, x, y }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [y, y - 100, y - 200],
        x: [x, x + Math.random() * 50 - 25, x + Math.random() * 100 - 50]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none text-xl sm:text-2xl md:text-3xl z-0"
      style={{ left: x, top: y }}
    >
      {emoji}
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { boards, loading, error, createBoard, deleteBoard } = useMoodBoards();
  const { currentMood, setCurrentMood, moodList, moodHistory, getCurrentMoodFont, addMoodToHistory } = useMood();
  const [particles, setParticles] = useState([]);
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
  const y1 = useTransform(scrollY, [0, 600], [0, 100]);
  const y2 = useTransform(scrollY, [0, 600], [0, -80]);
  const y3 = useTransform(scrollY, [0, 600], [0, 60]);

  // Generate floating emoji particles
  useEffect(() => {
    const emojis = ['😊', '😢', '😠', '😨', '🤢', '😲'];
    const newParticles = [];
    
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4
      });
    }
    
    setParticles(newParticles);
  }, []);

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

  const getMoodTextColor = (mood) => {
    const colors = {
      happy: 'text-yellow-800',
      sad: 'text-blue-800',
      angry: 'text-red-800',
      fear: 'text-gray-800',
      disgust: 'text-green-800',
      surprise: 'text-pink-800'
    };
    return colors[mood] || 'text-yellow-800';
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
      
      // Update mood history with the created board's mood
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
          className="text-2xl font-semibold text-gray-700 font-poppins"
        >
          Loading your mood boards...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getMoodBgGradient(currentMood)} flex items-center justify-center`}>
        <div className="text-red-600 text-xl font-poppins">Error: {error}</div>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef} 
      className={`min-h-screen relative overflow-x-hidden bg-gradient-to-br ${getMoodBgGradient(currentMood)} transition-all duration-1000`}
    >
      {/* Floating Emoji Particles */}
      {particles.map(particle => (
        <FloatingEmoji
          key={particle.id}
          emoji={particle.emoji}
          delay={particle.delay}
          duration={particle.duration}
          x={particle.x}
          y={particle.y}
        />
      ))}

      {/* Parallax Animated Background */}
      <motion.div 
        style={{ y: y1 }} 
        className={`absolute top-20 left-20 w-32 h-32 bg-gradient-to-r ${getMoodGradient(currentMood)} rounded-full blur-xl z-0 opacity-30 transition-all duration-1000`} 
      />
      <motion.div 
        style={{ y: y2 }} 
        className={`absolute top-40 right-20 w-24 h-24 bg-gradient-to-r ${getMoodGradient(currentMood)} rounded-full blur-xl z-0 opacity-30 transition-all duration-1000`} 
      />
      <motion.div 
        style={{ y: y3 }} 
        className={`absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r ${getMoodGradient(currentMood)} rounded-full blur-xl z-0 opacity-30 transition-all duration-1000`} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-6"
          >
            <div className="text-6xl sm:text-7xl mb-4">🎭</div>
          </motion.div>

          <h1 
            className={`text-4xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat tracking-wider transition-all duration-1000`}
          >
            WELCOME BACK, {user?.displayName?.split(' ')[0].toUpperCase()|| 'Friend'}! 👋
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light font-poppins">
            Express your emotions through beautiful mood boards and track your emotional journey
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}>
            <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat`}>{boards.length}</div>
            <div className="text-gray-600 font-medium font-poppins">Mood Boards</div>
          </div>
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}>
            <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat`}>{moodHistory.length}</div>
            <div className="text-gray-600 font-medium font-poppins">Mood Entries</div>
          </div>
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}>
            <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat`}>{boards.filter(b => b.isPublic).length}</div>
            <div className="text-gray-600 font-medium font-poppins">Public Boards</div>
          </div>
        </motion.div>

        {/* Mood Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center font-montserrat tracking-wide">How are you feeling?</h3>
            <div className="flex gap-3 flex-wrap justify-center">
              {moodList.map((mood) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMood(mood)}
                  className={`px-4 py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 font-poppins ${
                    currentMood === mood
                      ? `bg-gradient-to-r ${getMoodGradient(mood)} text-white shadow-lg scale-110`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Create Board Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`bg-gradient-to-r ${getMoodGradient(currentMood)} text-white px-8 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-montserrat tracking-wide`}
          >
            {showCreateForm ? 'Cancel' : '✨ Create New Mood Board'}
          </motion.button>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-12"
          >
            <form onSubmit={handleCreateBoard} className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center font-montserrat tracking-wide">Create Your Mood Board</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 font-poppins">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
                    placeholder="My Happy Place"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 font-poppins">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
                    rows={3}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 font-poppins">Initial Mood</label>
                  <select
                    value={formData.mood}
                    onChange={e => setFormData({ ...formData, mood: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
                  >
                    {moodList.map(mood => (
                      <option key={mood} value={mood}>
                        {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="text-gray-700 text-lg font-poppins">Make this board public</label>
                </div>
                <button 
                  type="submit" 
                  className={`w-full bg-gradient-to-r ${getMoodGradient(currentMood)} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 font-montserrat tracking-wide`}
                >
                  Create Board
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Mood Boards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat tracking-wide transition-all duration-1000`}>
            Your Mood Boards ({boards.length})
          </h2>
          {boards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎭</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4 font-montserrat tracking-wide">
                No mood boards yet
              </h3>
              <p className="text-gray-500 text-xl max-w-md mx-auto font-poppins">
                Create your first mood board to start expressing your feelings and emotions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {boards.map((board, index) => (
                <motion.div
                  key={board._id || board.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border ${getMoodBorderColor(board.detectedEmotion || board.mood)} ${getMoodShadowColor(board.detectedEmotion || board.mood)} hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`h-2 bg-gradient-to-r ${getMoodGradient(board.detectedEmotion || board.mood)}`}></div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 font-montserrat tracking-wide">{board.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getMoodGradient(board.detectedEmotion || board.mood)} text-white font-poppins`}>
                          {getMoodEmoji(board.detectedEmotion || board.mood)} {board.detectedEmotion || board.mood}
                        </span>
                        {board.isPublic && (
                          <span className="px-2 py-1 text-xs rounded bg-purple-500 text-white font-poppins">Public</span>
                        )}
                      </div>
                    </div>
                    {board.description && (
                      <p className="text-gray-600 mb-4 text-lg font-poppins">{board.description}</p>
                    )}
                    {board.detectedEmotion && board.emotionConfidence && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-800 font-poppins">
                          <strong>AI Detected:</strong> {board.detectedEmotion} 
                          <span className="ml-2 text-blue-600">
                            ({(board.emotionConfidence * 100).toFixed(1)}% confidence)
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 font-poppins">
                      <span>{board.items && Array.isArray(board.items) ? board.items.length : 0} items</span>
                      <span>{board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const boardId = board._id || board.id;
                          if (boardId) {
                            handleDeleteBoard(boardId);
                          } else {
                            console.error('No valid board ID found:', board);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors font-poppins"
                      >
                        Delete
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