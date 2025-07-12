import { useState, useEffect, useCallback } from 'react';

export const useChatFallback = (roomId = 'happy') => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Send a message
  const sendMessage = useCallback(async (text, user) => {
    if (!text.trim() || !roomId) return;

    try {
      const messageData = {
        id: Date.now().toString(),
        text: text.trim(),
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photo,
        timestamp: new Date(),
        type: 'text'
      };

      // Add to local state
      setMessages(prev => [...prev, messageData]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [roomId]);

  // Send a mood-based message
  const sendMoodMessage = useCallback(async (mood, user) => {
    if (!roomId) return;

    try {
      const moodEmojis = {
        happy: '😊',
        calm: '😌',
        energetic: '⚡',
        reflective: '🤔',
        peaceful: '🌸',
        creative: '🎨'
      };

      const messageData = {
        id: Date.now().toString(),
        text: `I'm feeling ${mood} today! ${moodEmojis[mood]}`,
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photo,
        timestamp: new Date(),
        type: 'mood',
        mood: mood
      };

      // Add to local state
      setMessages(prev => [...prev, messageData]);
    } catch (err) {
      console.error('Error sending mood message:', err);
      setError('Failed to send mood message');
    }
  }, [roomId]);

  // Delete a message (only for message owner)
  const deleteMessage = useCallback(async (messageId, userId) => {
    if (!roomId) return;

    try {
      setMessages(prev => prev.filter(msg => !(msg.id === messageId && msg.userId === userId)));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  }, [roomId]);

  // Update typing status
  const updateTypingStatus = useCallback(async (user, isTyping) => {
    if (!roomId) return;

    try {
      if (isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== user.id), {
          userId: user.id,
          userName: user.displayName,
          timestamp: new Date()
        }]);
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== user.id));
      }
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  }, [roomId]);

  // Load initial messages
  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    // Simulate loading
    setTimeout(() => {
      const initialMessages = [
        {
          id: '1',
          text: 'Welcome to the chat room! 👋',
          userId: 'system',
          userName: 'System',
          timestamp: new Date(Date.now() - 60000),
          type: 'text'
        },
        {
          id: '2',
          text: 'Feel free to share your thoughts and emotions! 💭',
          userId: 'system',
          userName: 'System',
          timestamp: new Date(Date.now() - 30000),
          type: 'text'
        }
      ];

      setMessages(initialMessages);
      setLoading(false);
    }, 1000);
  }, [roomId]);

  // Clean up typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => 
          user.timestamp && Date.now() - user.timestamp.getTime() < 5000
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendMoodMessage,
    deleteMessage,
    updateTypingStatus,
    typingUsers,
    isTyping,
    setIsTyping
  };
}; 