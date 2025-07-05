import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export const useAnalytics = (userId) => {
  const [moodStats, setMoodStats] = useState({
    totalMoods: 0,
    moodDistribution: {},
    weeklyTrends: [],
    averageMood: 'neutral'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track mood event
  const trackMood = useCallback(async (mood, context = {}) => {
    if (!userId) return;

    try {
      const moodEvent = {
        userId,
        mood,
        timestamp: serverTimestamp(),
        context: {
          ...context,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      await addDoc(collection(db, 'moodEvents'), moodEvent);
    } catch (err) {
      console.error('Error tracking mood:', err);
    }
  }, [userId]);

  // Track board creation
  const trackBoardCreation = useCallback(async (boardData) => {
    if (!userId) return;

    try {
      const boardEvent = {
        userId,
        action: 'board_created',
        boardData: {
          title: boardData.title,
          mood: boardData.mood,
          itemCount: boardData.items?.length || 0
        },
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'userActions'), boardEvent);
    } catch (err) {
      console.error('Error tracking board creation:', err);
    }
  }, [userId]);

  // Track chat message
  const trackChatMessage = useCallback(async (messageType, mood = null) => {
    if (!userId) return;

    try {
      const chatEvent = {
        userId,
        action: 'chat_message',
        messageType,
        mood,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'userActions'), chatEvent);
    } catch (err) {
      console.error('Error tracking chat message:', err);
    }
  }, [userId]);

  // Get mood statistics
  const getMoodStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get user's mood events
      const moodQuery = query(
        collection(db, 'moodEvents'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(moodQuery);
      const moodEvents = [];
      
      snapshot.forEach((doc) => {
        moodEvents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Calculate statistics
      const moodCounts = {};
      let totalMoods = moodEvents.length;

      moodEvents.forEach(event => {
        moodCounts[event.mood] = (moodCounts[event.mood] || 0) + 1;
      });

      // Calculate average mood
      const moodScores = {
        happy: 5,
        energetic: 4,
        peaceful: 3,
        calm: 2,
        reflective: 1,
        sad: 0
      };

      let totalScore = 0;
      moodEvents.forEach(event => {
        totalScore += moodScores[event.mood] || 0;
      });

      const averageScore = totalMoods > 0 ? totalScore / totalMoods : 0;
      let averageMood = 'neutral';
      
      if (averageScore >= 4) averageMood = 'happy';
      else if (averageScore >= 2.5) averageMood = 'peaceful';
      else if (averageScore >= 1) averageMood = 'calm';
      else averageMood = 'reflective';

      // Calculate weekly trends
      const weeklyTrends = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayEvents = moodEvents.filter(event => {
          const eventTime = event.timestamp?.toDate() || new Date(event.context?.timestamp);
          return eventTime >= dayStart && eventTime <= dayEnd;
        });

        const dayMoodCounts = {};
        dayEvents.forEach(event => {
          dayMoodCounts[event.mood] = (dayMoodCounts[event.mood] || 0) + 1;
        });

        weeklyTrends.push({
          date: dayStart.toISOString().split('T')[0],
          moodCounts: dayMoodCounts,
          totalEvents: dayEvents.length
        });
      }

      setMoodStats({
        totalMoods,
        moodDistribution: moodCounts,
        weeklyTrends,
        averageMood
      });

    } catch (err) {
      console.error('Error getting mood stats:', err);
      setError('Failed to load mood statistics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Get real-time mood updates
  useEffect(() => {
    if (!userId) return;

    const moodQuery = query(
      collection(db, 'moodEvents'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(moodQuery, (snapshot) => {
      // Update stats when new mood events are added
      getMoodStats();
    });

    return () => unsubscribe();
  }, [userId, getMoodStats]);

  // Initial load
  useEffect(() => {
    if (userId) {
      getMoodStats();
    }
  }, [userId, getMoodStats]);

  return {
    moodStats,
    loading,
    error,
    trackMood,
    trackBoardCreation,
    trackChatMessage,
    getMoodStats
  };
}; 