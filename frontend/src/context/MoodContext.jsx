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

  return (
    <MoodContext.Provider value={{ 
      currentMood, 
      setCurrentMood, 
      moodList, 
      moodHistory, 
      addMoodToHistory,
      getCurrentMoodFont,
      moodFonts 
    }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext); 