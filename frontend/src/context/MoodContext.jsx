import React, { createContext, useContext, useState } from 'react';

const MoodContext = createContext();

const defaultMood = 'happy';
const moodList = [
  'happy',
  'sad', 
  'angry',
  'fear',
  'disgust',
  'surprise'
];

// Minimalistic and visually appealing fonts for each mood
const moodFonts = {
  happy: 'Inter, system-ui, sans-serif', // Clean, modern, friendly
  sad: 'Merriweather, Georgia, serif', // Elegant, refined, contemplative
  angry: 'Roboto Condensed, system-ui, sans-serif', // Bold, strong, assertive
  fear: 'Source Code Pro, monospace', // Technical, precise, cautious
  disgust: 'Open Sans, system-ui, sans-serif', // Clean, neutral, balanced
  surprise: 'Poppins, system-ui, sans-serif' // Modern, dynamic, energetic
};

export const MoodProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState(defaultMood);
  const [moodHistory, setMoodHistory] = useState([]);

  const addMoodToHistory = (mood, confidence = 0.8) => {
    const newEntry = {
      mood,
      confidence,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    setMoodHistory(prev => [newEntry, ...prev.slice(0, 29)]); // Keep last 30 entries
  };

  const getCurrentMoodFont = () => moodFonts[currentMood] || moodFonts.happy;

  // --- Add these utility functions ---
  const getMoodGradient = (mood) => {
    const gradients = {
      happy: 'from-yellow-400 via-orange-400 to-yellow-500',
      sad: 'from-blue-400 via-indigo-500 to-purple-500',
      angry: 'from-red-400 via-pink-500 to-red-500',
      fear: 'from-gray-400 via-gray-500 to-gray-600',
      disgust: 'from-green-400 via-teal-500 to-green-500',
      surprise: 'from-pink-400 via-purple-500 to-pink-500'
    };
    return gradients[mood] || gradients.happy;
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
    return gradients[mood] || gradients.happy;
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
    return colors[mood] || colors.happy;
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
    return colors[mood] || colors.happy;
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
    return shadows[mood] || shadows.happy;
  };
  // --- End utility functions ---

  return (
    <MoodContext.Provider value={{ 
      currentMood, 
      setCurrentMood, 
      moodList, 
      moodHistory, 
      addMoodToHistory,
      getCurrentMoodFont,
      moodFonts,
      // Export all utility functions!
      getMoodGradient,
      getMoodBgGradient,
      getMoodTextColor,
      getMoodBorderColor,
      getMoodShadowColor
    }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext); 