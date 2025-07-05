import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  where,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const useChat = (roomId = 'happy') => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Send a message
  const sendMessage = useCallback(async (text, user) => {
    if (!text.trim() || !roomId) return;

    try {
      const messageData = {
        text: text.trim(),
        userId: user.id || user.googleId,
        userName: user.displayName,
        userPhoto: user.photo,
        timestamp: serverTimestamp(),
        type: 'text'
      };

      // Add to the specific room's messages collection
      await addDoc(collection(db, `chatRooms/${roomId}/messages`), messageData);
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
        text: `I'm feeling ${mood} today! ${moodEmojis[mood]}`,
        userId: user.id || user.googleId,
        userName: user.displayName,
        userPhoto: user.photo,
        timestamp: serverTimestamp(),
        type: 'mood',
        mood: mood
      };

      // Add to the specific room's messages collection
      await addDoc(collection(db, `chatRooms/${roomId}/messages`), messageData);
    } catch (err) {
      console.error('Error sending mood message:', err);
      setError('Failed to send mood message');
    }
  }, [roomId]);

  // Delete a message (only for message owner)
  const deleteMessage = useCallback(async (messageId, userId) => {
    if (!roomId) return;

    try {
      const messageRef = doc(db, `chatRooms/${roomId}/messages`, messageId);
      await deleteDoc(messageRef);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  }, [roomId]);

  // Update typing status
  const updateTypingStatus = useCallback(async (user, isTyping) => {
    if (!roomId) return;

    try {
      const typingRef = doc(db, `chatRooms/${roomId}/typing`, user.id || user.googleId);
      
      if (isTyping) {
        await updateDoc(typingRef, {
          userId: user.id || user.googleId,
          userName: user.displayName,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  }, [roomId]);

  // Listen to messages
  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    const messagesQuery = query(
      collection(db, `chatRooms/${roomId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList = [];
        snapshot.forEach((doc) => {
          messageList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setMessages(messageList.reverse()); // Show newest at bottom
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to messages:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // Listen to typing indicators
  useEffect(() => {
    if (!roomId) return;

    const typingQuery = query(
      collection(db, `chatRooms/${roomId}/typing`)
    );

    const unsubscribe = onSnapshot(
      typingQuery,
      (snapshot) => {
        const typingUsersList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only show typing if within last 5 seconds
          if (data.timestamp && Date.now() - data.timestamp.toMillis() < 5000) {
            typingUsersList.push(data);
          }
        });
        setTypingUsers(typingUsersList);
      },
      (err) => {
        console.error('Error listening to typing indicators:', err);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

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