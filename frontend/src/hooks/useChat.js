import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from './useAuth.jsx';
import rooms from '../../../shared/rooms.json';

const roomIds = new Set(rooms.map((room) => room.id));
const TYPING_TTL = 5000;
// These fields are retention metadata only while the project stays on Firebase Spark.
const MESSAGE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const TYPING_RETENTION_MS = 10 * 60 * 1000;

export const useChat = (roomId = 'happy') => {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;
  const validRoom = roomIds.has(roomId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const sendLock = useRef(false);
  const typingTimer = useRef(null);
  const lastTypingWrite = useRef(0);
  const typingQueue = useRef(Promise.resolve());

  const requireUser = useCallback(() => {
    const current = auth.currentUser;
    if (!current || current.uid !== uid) throw new Error('Sign in with Google to join this room.');
    if (!validRoom) throw new Error('This room is not available.');
    return current;
  }, [uid, validRoom]);

  const send = useCallback(async (text, mood) => {
    // The lock prevents accidental double-sends when a user taps Send twice.
    if (sendLock.current) return false;
    const safeText = typeof text === 'string' ? text.trim() : '';
    if (!safeText || safeText.length > 4000) {
      setError('Messages must contain between 1 and 4000 characters.');
      return false;
    }
    sendLock.current = true;
    setSending(true);
    try {
      const current = requireUser();
      await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
        text: safeText, userId: current.uid,
        userName: current.displayName || 'Community member',
        userPhoto: current.photoURL || '',
        timestamp: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + MESSAGE_RETENTION_MS),
        type: mood ? 'mood' : 'text',
        ...(mood ? { mood } : {})
      });
      setError(null);
      return true;
    } catch {
      setError('Your message could not be sent. Check your connection and try again.');
      return false;
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  }, [roomId, requireUser]);
  const sendMessage = useCallback((text) => send(text), [send]);
  const sendMoodMessage = useCallback((mood) => {
    const room = rooms.find((entry) => entry.id === mood);
    return room ? send(`I'm feeling ${mood} today! ${room.mark}`, mood) : Promise.resolve(false);
  }, [send]);

  const deleteMessage = useCallback(async (messageId, userId) => {
    try {
      const current = requireUser();
      if (current.uid !== userId) throw new Error('You can only remove your own messages.');
      if (typeof messageId !== 'string' || !messageId || messageId.includes('/')) throw new Error('Invalid message.');
      await deleteDoc(doc(db, 'chatRooms', roomId, 'messages', messageId));
      setError(null);
    } catch {
      setError('Your message could not be removed. Please try again.');
    }
  }, [roomId, requireUser]);

  const updateTypingStatus = useCallback((_user, typing) => {
    if (!uid || !validRoom || auth.currentUser?.uid !== uid) return;
    clearTimeout(typingTimer.current);
    const ref = doc(db, 'chatRooms', roomId, 'typing', uid);
    const write = (active) => {
      // Serialize writes so a delayed heartbeat cannot resurrect a removed indicator.
      const name = auth.currentUser?.displayName || 'Community member';
      typingQueue.current = typingQueue.current.catch(() => {}).then(() => active
        ? setDoc(ref, { userId: uid, userName: name, timestamp: serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + TYPING_RETENTION_MS) })
        : deleteDoc(ref)).catch(() => {});
    };
    if (!typing) {
      lastTypingWrite.current = 0;
      write(false);
      return;
    }
    const now = Date.now();
    if (now - lastTypingWrite.current >= 2500) {
      lastTypingWrite.current = now;
      write(true);
    }
    typingTimer.current = setTimeout(() => { lastTypingWrite.current = 0; write(false); }, 4000);
  }, [uid, roomId, validRoom]);

  useEffect(() => {
    setMessages([]);
    setTypingUsers([]);
    setError(null);
    setLoadError(null);
    setLoading(Boolean(uid && validRoom));
    if (!uid || !validRoom) {
      setLoadError(!validRoom ? 'This room is not available.' : 'Sign in to join this room.');
      return;
    }
    const unsubscribe = onSnapshot(query(collection(db, 'chatRooms', roomId, 'messages'), orderBy('timestamp', 'desc'), limit(100)),
      (snapshot) => { setMessages(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id })).reverse()); setLoading(false); },
      () => { setMessages([]); setLoadError('Could not load this room. Please reconnect and try again.'); setLoading(false); });
    return unsubscribe;
  }, [roomId, uid, validRoom]);

  useEffect(() => {
    if (!uid || !validRoom) return;
    let records = [];
    const refresh = () => setTypingUsers(records.filter((entry) => entry.userId !== uid && entry.timestamp?.toMillis && Date.now() - entry.timestamp.toMillis() < TYPING_TTL));
    // Bound reads to the newest indicators instead of every user who ever typed here.
    const unsubscribe = onSnapshot(query(collection(db, 'chatRooms', roomId, 'typing'), orderBy('timestamp', 'desc'), limit(100)),
      (snapshot) => { records = snapshot.docs.map((entry) => entry.data()); refresh(); },
      () => { records = []; setTypingUsers([]); });
    const interval = setInterval(refresh, 1000);
    return () => {
      unsubscribe();
      clearInterval(interval);
      clearTimeout(typingTimer.current);
      lastTypingWrite.current = 0;
      const ref = doc(db, 'chatRooms', roomId, 'typing', uid);
      typingQueue.current = typingQueue.current.catch(() => {}).then(() => deleteDoc(ref)).catch(() => {});
    };
  }, [roomId, uid, validRoom]);

  return { messages, loading, error, loadError, sending, sendMessage, sendMoodMessage, deleteMessage, updateTypingStatus, typingUsers };
};
