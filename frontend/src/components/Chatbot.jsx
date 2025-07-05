import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMood } from '../context/MoodContext.jsx';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { user } = useAuth();
  const { currentMood, addMoodToHistory } = useMood();
  const [userRegion] = useState('tamil'); // Default to Tamil region

  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Welcome messages with Tamil touch
  const welcomeMessages = [
    "Vaa macha! 🎭 Welcome to Emote Moder! Namma velaya paapom - let's explore your emotions together!",
    "Hey macha! Ready to dive into your feelings? Vaa, namma pesalam!",
    "Vaa macha! Your emotional journey starts here! Poitu namma velaya paapom!",
    "Welcome macha! Let's make your emotions our business! Super ah irukku!"
  ];

  useEffect(() => {
    // Set a random welcome message on component mount
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setMessages([{
      sender: 'bot',
      text: randomWelcome,
      emotion: 'happy'
    }]);
  }, []);

  // Friendly Tamil responses based on emotions
  const tamilResponses = {
    happy: [
      "Romba nalla irukku macha! 😊 Your happiness is contagious!",
      "Super ah irukku! Keep that positive energy flowing!",
      "Vaa macha, indha mood ah maintain pannanum!",
      "Romba santhosham! Your joy makes me happy too!"
    ],
    sad: [
      "Don't worry macha, everything will be alright! 😢",
      "Nee oru strong person! This phase will pass!",
      "Vaa macha, namma pesalam. I'm here for you!",
      "Don't give up! You're stronger than you think!"
    ],
    angry: [
      "Cool down macha! 😠 Take a deep breath!",
      "Anger is temporary, but peace is permanent!",
      "Vaa macha, calm ah irukalam. What happened?",
      "Don't let anger control you! You're better than that!"
    ],
    fear: [
      "Don't be afraid macha! 😨 You're not alone!",
      "Fear is just a feeling! You can overcome it!",
      "Vaa macha, namma face pannalam! Be brave!",
      "Everything will be okay! Trust yourself!"
    ],
    disgust: [
      "Eww macha! 🤢 Let's focus on something better!",
      "Don't let negativity affect you!",
      "Vaa macha, positive thoughts ah focus pannalam!",
      "You deserve better vibes! Let's change the mood!"
    ],
    surprise: [
      "Wow macha! 😲 That's amazing!",
      "Incredible! You never cease to amaze me!",
      "Vaa macha, indha excitement ah share pannanum!",
      "Super! Keep surprising yourself!"
    ]
  };

  // Regional slang and friendly phrases
  const friendlyPhrases = [
    "Vaa macha!",
    "Poitu namma velaya paapom!",
    "Super ah irukku!",
    "Romba nalla irukku!",
    "Keep it up macha!",
    "You're doing great!",
    "Namma together ah irukalam!",
    "Don't worry, I'm here!",
    "Let's figure this out together!",
    "You've got this macha!"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    disgust: '🤢',
    surprise: '😲'
  };

  const emotionColors = {
    happy: 'bg-mood-happy-primary text-white',
    sad: 'bg-mood-sad-primary text-white',
    angry: 'bg-mood-angry-primary text-white',
    fear: 'bg-mood-fear-primary text-white',
    disgust: 'bg-mood-disgust-primary text-white',
    surprise: 'bg-mood-surprise-primary text-white'
  };

  const getRandomTamilResponse = (emotion) => {
    const responses = tamilResponses[emotion] || tamilResponses.happy;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const randomPhrase = friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)];
    return `${randomPhrase} ${randomResponse}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input, emotion: currentMood };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Analyze emotion of user input
      const emotionResponse = await axios.post(`${API_BASE}/api/analyze-emotion`, {
        text: input
      }, { withCredentials: true });

      const detectedEmotion = emotionResponse.data.emotion;
      addMoodToHistory(detectedEmotion, emotionResponse.data.confidence);

      // Generate AI response with emotion context
      const response = await axios.post(`${API_BASE}/api/chatbot`, {
        message: input,
        emotion: detectedEmotion,
        includeTamil: true
      }, { withCredentials: true });

      // Use AI response or fallback to contextual responses
      const botResponse = response.data.reply || getRandomTamilResponse(detectedEmotion);
      
      const botMsg = {
        sender: 'bot',
        text: botResponse,
        emotion: detectedEmotion
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error('Chat error:', err);
      // Better fallback response based on input content
      const fallbackEmotion = input.toLowerCase().includes('sad') || input.toLowerCase().includes('depressed') ? 'sad' : 
                             input.toLowerCase().includes('angry') || input.toLowerCase().includes('mad') ? 'angry' :
                             input.toLowerCase().includes('scared') || input.toLowerCase().includes('afraid') ? 'fear' :
                             input.toLowerCase().includes('disgust') || input.toLowerCase().includes('gross') ? 'disgust' :
                             input.toLowerCase().includes('surprise') || input.toLowerCase().includes('wow') ? 'surprise' : 'happy';
      
      const fallbackResponse = getRandomTamilResponse(fallbackEmotion);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: fallbackResponse,
        emotion: fallbackEmotion
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:shadow-xl transition-all duration-300"
        aria-label="Open Modobot"
      >
        {isOpen ? '✕' : '🎭'}
      </motion.button>

      {/* Chatbot Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">🎭</div>
                  <div>
                    <h3 className="font-bold text-lg">Modobot</h3>
                    <p className="text-sm opacity-90">AI Emotion Companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Voice Control Unavailable
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  📊 Mood Summary
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? `${emotionColors[msg.emotion] || 'bg-blue-500 text-white'}`
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {msg.sender === 'bot' && (
                        <span className="text-lg">{emotionEmojis[msg.emotion] || '🤖'}</span>
                      )}
                      <span className="text-xs opacity-70">
                        {msg.sender === 'user' ? 'You' : 'Modobot'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your feelings..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳' : '💬'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 