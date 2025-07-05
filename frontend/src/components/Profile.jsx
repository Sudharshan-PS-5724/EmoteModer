import React from 'react';
import { motion } from 'framer-motion';
import { useMood } from '../context/MoodContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const moodBgStyles = {
  happy: 'bg-mood-happy-background',
  sad: 'bg-mood-sad-background',
  angry: 'bg-mood-angry-background',
  fear: 'bg-mood-fear-background',
  disgust: 'bg-mood-disgust-background',
  surprise: 'bg-mood-surprise-background',
};

const moodTextStyles = {
  happy: 'text-mood-happy-text',
  sad: 'text-mood-sad-text',
  angry: 'text-mood-angry-text',
  fear: 'text-mood-fear-text',
  disgust: 'text-mood-disgust-text',
  surprise: 'text-mood-surprise-text',
};

const moodCardStyles = {
  happy: 'bg-mood-happy-primary/20 border-mood-happy-primary',
  sad: 'bg-mood-sad-primary/20 border-mood-sad-primary',
  angry: 'bg-mood-angry-primary/20 border-mood-angry-primary',
  fear: 'bg-mood-fear-primary/20 border-mood-fear-primary',
  disgust: 'bg-mood-disgust-primary/20 border-mood-disgust-primary',
  surprise: 'bg-mood-surprise-primary/20 border-mood-surprise-primary',
};

const Profile = () => {
  const { currentMood, setCurrentMood, moodList } = useMood();
  const { user } = useAuth();
  const bgClass = moodBgStyles[currentMood] || moodBgStyles.happy;
  const textClass = moodTextStyles[currentMood] || moodTextStyles.happy;
  const cardClass = moodCardStyles[currentMood] || moodCardStyles.happy;

  return (
    <div className={`min-h-[80vh] transition-colors duration-500 ${bgClass} ${textClass} px-2 sm:px-6`}>
      {/* Mood Switcher */}
      <div className="flex justify-end mb-6 sm:mb-8">
        <div className="flex gap-2 items-center">
          {moodList.map((mood) => (
            <motion.button
              key={mood}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMood(mood)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-300 focus:outline-none ${
                currentMood === mood
                  ? cardClass + ' scale-110 shadow-lg'
                  : 'bg-white/40 border-gray-200 hover:scale-105'
              }`}
              aria-label={mood}
            />
          ))}
        </div>
      </div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`mood-card glass-effect border-2 ${cardClass} max-w-xs sm:max-w-xl mx-auto mb-8 sm:mb-10`}
      >
        <div className="flex flex-col items-center">
          {/* Avatar fallback */}
          {user && user.photo ? (
            <img
              src={user.photo}
              alt={user.displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-mood-happy-primary shadow-md mb-4"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-bold text-3xl sm:text-4xl border-2 border-mood-happy-primary shadow-md mb-4 bg-mood-happy-primary/20 text-mood-happy-text">
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <h2 className="text-xl sm:text-3xl font-playfair font-bold mb-2">Your Profile</h2>
          <p className="text-mood-happy-text/70 text-sm sm:text-base">Mood-adaptive profile details and stats go here.</p>
        </div>
      </motion.div>

      {/* Mood History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xs sm:max-w-3xl mx-auto"
      >
        <h3 className="text-lg sm:text-2xl font-poppins font-semibold mb-3 sm:mb-4">Mood History</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`mood-card glass-effect border-2 ${cardClass}`}
            >
              <div className="text-base sm:text-lg font-semibold">Mood {idx + 1}</div>
              <div className="text-xs sm:text-sm text-mood-happy-text/70">Details...</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 