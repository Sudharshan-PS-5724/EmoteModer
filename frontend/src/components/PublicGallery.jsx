import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMood } from '../context/MoodContext.jsx';
import { config } from '../config.js';

const moodCardStyles = {
  happy: 'bg-mood-happy-primary/20 border-mood-happy-primary',
  sad: 'bg-mood-sad-primary/20 border-mood-sad-primary',
  angry: 'bg-mood-angry-primary/20 border-mood-angry-primary',
  fear: 'bg-mood-fear-primary/20 border-mood-fear-primary',
  disgust: 'bg-mood-disgust-primary/20 border-mood-disgust-primary',
  surprise: 'bg-mood-surprise-primary/20 border-mood-surprise-primary',
};

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fear: '😨',
  disgust: '🤢',
  surprise: '😲',
};

const PublicGallery = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentMood } = useMood();

  useEffect(() => {
    const fetchPublicBoards = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.getApiUrl()}/api/moodboards/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch public boards');
        }
        
        const data = await response.json();
        setBoards(data);
      } catch (err) {
        console.error('Error fetching public boards:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBoards();
  }, []);

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'from-yellow-400 to-orange-400',
      sad: 'from-blue-400 to-purple-400',
      angry: 'from-red-400 to-pink-400',
      fear: 'from-gray-400 to-gray-600',
      disgust: 'from-green-400 to-teal-400',
      surprise: 'from-pink-400 to-purple-400'
    };
    return colors[mood] || 'from-purple-400 to-blue-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-pink-50 px-2 sm:px-6 py-10">
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-pink-50 px-2 sm:px-6 py-10">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-pink-50 px-2 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            🌏 Public Mood Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Discover and connect with emotions shared by the community
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{boards.length}</div>
              <div className="text-sm text-gray-600">Public Boards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {boards.filter(b => b.detectedEmotion).length}
              </div>
              <div className="text-sm text-gray-600">AI Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(boards.map(b => b.userId)).size}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </motion.div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">🎭</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No public mood boards yet
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Be the first to share your emotions with the community! Create a mood board and make it public.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board, index) => {
              const cardClass = moodCardStyles[board.detectedEmotion || board.mood] || moodCardStyles.happy;
              const moodColor = getMoodColor(board.detectedEmotion || board.mood);
              
              return (
                <motion.div
                  key={board._id || board.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Mood indicator bar */}
                  <div className={`h-2 bg-gradient-to-r ${moodColor}`}></div>
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {moodEmojis[board.detectedEmotion || board.mood] || '😊'}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-800 truncate">
                          {board.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                        Public
                      </span>
                    </div>

                    {/* Description */}
                    {board.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {board.description}
                      </p>
                    )}

                    {/* AI Analysis */}
                    {board.detectedEmotion && board.emotionConfidence && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">
                            AI Detected: {board.detectedEmotion}
                          </span>
                          <span className="text-xs text-blue-600">
                            {(board.emotionConfidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Items count */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{board.items && Array.isArray(board.items) ? board.items.length : 0} items</span>
                      <span>{formatDate(board.createdAt)}</span>
                    </div>

                    {/* User info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {board.userId ? board.userId.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-xs text-gray-500">
                          {board.userId ? `User ${board.userId.slice(0, 8)}...` : 'Anonymous'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PublicGallery; 