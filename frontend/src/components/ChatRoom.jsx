import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { useChat } from '../hooks/useChat';
import { useMood } from '../context/MoodContext.jsx';

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

const ChatRoom = ({ roomId, roomName, roomEmoji }) => {
  const { user, firebaseUser } = useAuth();
  const {
    messages,
    loading,
    error,
    loadError,
    sendMessage,
    sendMoodMessage,
    deleteMessage,
    updateTypingStatus,
    typingUsers,
    sending
  } = useChat(roomId);

  const [newMessage, setNewMessage] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { currentMood } = useMood();
  const bgClass = moodBgStyles[currentMood] || moodBgStyles.happy;
  const textClass = moodTextStyles[currentMood] || moodTextStyles.happy;

  const moodEmojis = {
    happy: '✳',
    sad: '◒',
    angry: 'ϟ',
    fear: '⌁',
    disgust: '↗',
    surprise: '✦'
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const sent = await sendMessage(newMessage);
    if (sent) {
      setNewMessage('');
      updateTypingStatus(user, false);
    }
  };

  const handleMoodMessage = async (mood) => {
    if (await sendMoodMessage(mood)) setShowMoodPicker(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    updateTypingStatus(user, e.target.value.trim().length > 0);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600" role="alert">{loadError}</div>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-500 ${bgClass} ${textClass} rounded-xl shadow-lg h-[60vh] sm:h-[600px] flex flex-col`}>
      {/* Chat Header */}
      <div className={`chat-room-header chat-room-${roomId}`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="text-xl sm:text-2xl">{roomEmoji}</div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{roomName}</h3>
            <p className="text-xs sm:text-sm opacity-90">
              {messages.length} messages • {typingUsers.length > 0 && `${typingUsers.map(u => u.userName).join(', ')} typing...`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.userId === firebaseUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.userId === firebaseUser?.uid ? 'order-2' : 'order-1'}`}>
                {message.userId !== firebaseUser?.uid && (
                  <div className="flex items-center space-x-2 mb-1">
                    {message.userPhoto && (
                      <img
                        src={message.userPhoto}
                        alt={message.userName}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-xs text-gray-500 font-medium">
                      {message.userName}
                    </span>
                  </div>
                )}

                <div className={`
                  p-3 rounded-2xl shadow-sm
                  ${message.userId === firebaseUser?.uid
                    ? 'bg-gradient-to-r from-emote-deep-space-blue to-emote-wine-plum text-white'
                    : 'bg-gray-100 text-gray-800'
                  }
                  ${message.type === 'mood' ? 'border-2 border-dashed border-opacity-50' : ''}
                `}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm whitespace-pre-wrap break-words min-w-0" style={{ overflowWrap: 'anywhere' }}>{message.text}</span>
                    <span className={`text-xs ml-2 ${message.userId === firebaseUser?.uid ? 'text-white/70' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {message.userId === firebaseUser?.uid && (
                    <button
                      onClick={() => deleteMessage(message.id, firebaseUser?.uid)}
                      className="text-xs opacity-70 hover:opacity-100 mt-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-3 rounded-2xl">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {typingUsers.map(u => u.userName).join(', ')} typing...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
            aria-label={showMoodPicker ? 'Close mood picker' : 'Share a mood'}
            aria-expanded={showMoodPicker}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5 14.4 9l5.6 2.5-5.6 2.4L12 19.5l-2.4-5.6L4 11.5 9.6 9 12 3.5Z" />
              <path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onBlur={() => updateTypingStatus(user, false)}
            disabled={sending}
            aria-label="Message"
            maxLength={4000}
            placeholder="Type your message..."
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}

        {/* Mood Picker */}
        <AnimatePresence>
          {showMoodPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-center space-x-2">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodMessage(mood)}
                    disabled={sending}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title={`I'm feeling ${mood}`}
                  >
                    <span className="text-xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatRoom;
