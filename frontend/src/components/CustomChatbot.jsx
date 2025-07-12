import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '../context/MoodContext.jsx';
import { config } from '../config.js';

const CustomChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentMood } = useMood();

  // Smart Modobot personality
  const modobot = {
    name: 'Modobot',
    emoji: '🤖',
    systemPrompt: `You are Modobot, a highly intelligent and empathetic AI assistant specializing in emotional intelligence and mood analysis. You are:

1. **Emotionally Intelligent**: You understand and respond to human emotions with empathy and wisdom
2. **Multilingual**: You can speak in English, Hindi, Tamil, Telugu, and other Indian languages naturally
3. **Context-Aware**: You remember conversation context and provide personalized responses
4. **Mood-Adaptive**: You adjust your tone based on the user's current emotional state
5. **Supportive**: You provide encouragement, advice, and emotional support
6. **Wise**: You share insights about emotions, relationships, and personal growth
7. **Friendly**: You use warm, casual language with regional slang when appropriate

Current user mood: ${currentMood}

Respond in a way that matches the user's emotional state. If they're sad, be comforting. If they're happy, celebrate with them. If they're angry, help them calm down. Always be supportive and understanding.

Use phrases like "I understand how you feel", "That's completely valid", "You're not alone", "Things will get better", "I'm here for you", etc.

Keep responses conversational, helpful, and emotionally intelligent.`,
    color: 'from-purple-500 to-blue-500'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm ${modobot.name} ${modobot.emoji} Your AI companion for emotional support and mood analysis. How are you feeling today?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  const sendMessageToAI = async (userMessage) => {
    // Check if API key is available
    const apiKey = config.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key not found, using fallback responses');
      return getFallbackResponse(userMessage);
    }
    
    const requestBody = {
      model: "openrouter/meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: modobot.systemPrompt
        },
        ...messages
          .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
        {
          role: "user",
          content: userMessage
        }
      ]
    };

    try {
      console.log('Sending request to OpenRouter:', { model: requestBody.model, messageCount: requestBody.messages.length });
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Emote Moder - Modobot'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('OpenRouter response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('OpenRouter response data:', data);
        
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content;
        } else {
          console.error('No content in response:', data);
          return getFallbackResponse(userMessage);
        }
      } else {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        
        if (response.status === 401) {
          return 'Sorry, there\'s an authentication issue with the AI service. Please check your API key.';
        } else if (response.status === 429) {
          return 'Sorry, I\'m getting too many requests. Please wait a moment and try again.';
        } else {
          return getFallbackResponse(userMessage);
        }
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      return getFallbackResponse(userMessage);
    }
  };

  // Smart fallback response system
  const getFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Mood-based responses
    const moodResponses = {
      happy: [
        'I can see you\'re in a great mood! That\'s wonderful! 😊 What\'s making you feel so happy?',
        'Your happiness is contagious! I love seeing you in such a positive state!',
        'That\'s fantastic! When we\'re happy, everything feels possible. What\'s the highlight of your day?'
      ],
      sad: [
        'I can sense you\'re feeling down. It\'s okay to feel sad sometimes. You\'re not alone in this.',
        'I understand how difficult this must be for you. Remember, tough times don\'t last forever.',
        'Your feelings are completely valid. Would you like to talk about what\'s bothering you?'
      ],
      angry: [
        'I can feel the frustration in your message. It\'s natural to get angry sometimes.',
        'Take a deep breath. Anger is a valid emotion, but let\'s work through it together.',
        'I understand you\'re upset. What happened that made you feel this way?'
      ],
      fear: [
        'I can sense your anxiety. Fear is a natural response, but you\'re stronger than you think.',
        'It\'s okay to be afraid. Let\'s talk about what\'s worrying you.',
        'You\'re safe here. What\'s causing you to feel this way?'
      ],
      disgust: [
        'I understand that feeling. Sometimes things can be really unpleasant.',
        'That sounds really difficult to deal with. How can I help you through this?',
        'I\'m here to support you through this challenging time.'
      ],
      surprise: [
        'Wow! That\'s quite surprising! Tell me more about what happened.',
        'That\'s unexpected! How are you feeling about this?',
        'That\'s amazing! Surprises can be wonderful or challenging. What\'s your take on it?'
      ]
    };

    // Check for mood-specific responses first
    if (moodResponses[currentMood]) {
      const responses = moodResponses[currentMood];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! I'm Modobot 🤖 How can I help you today? I'm here to listen and support you.`;
    }
    
    if (lowerMessage.includes('how are you')) {
      return `I'm doing great, thank you for asking! I'm here and ready to support you. How are you feeling?`;
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return `Goodbye! Take care of yourself and remember, I'm always here when you need someone to talk to. 👋`;
    }
    
    if (lowerMessage.includes('help')) {
      return `I'm here to help! I can listen to your feelings, provide emotional support, help you understand your moods, and just be a friendly companion. What would you like to talk about?`;
    }
    
    if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
      return `I can see you're currently feeling ${currentMood}. That's completely normal! Would you like to talk about what's causing this mood?`;
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('lonely')) {
      return `I can sense you're going through a difficult time. Your feelings are valid, and you don't have to go through this alone. I'm here to listen and support you.`;
    }
    
    if (lowerMessage.includes('angry') || lowerMessage.includes('mad') || lowerMessage.includes('frustrated')) {
      return `I understand you're feeling angry. That's a natural emotion. Let's talk about what's causing this frustration. Sometimes just talking about it can help.`;
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
      return `Anxiety can be really overwhelming. You're not alone in feeling this way. Let's work through this together. What's on your mind?`;
    }
    
    // Default intelligent responses
    const defaultResponses = [
      'That\'s really interesting! Tell me more about how you\'re feeling.',
      'I understand. Your feelings are completely valid. Would you like to elaborate?',
      'That sounds important to you. I\'m here to listen and support you.',
      'I can sense this matters to you. How are you coping with this?',
      'Thank you for sharing that with me. How can I best support you right now?',
      'I\'m here for you. Whatever you\'re going through, you don\'t have to face it alone.',
      'That\'s a valid perspective. How are you feeling about this situation?',
      'I appreciate you opening up to me. What would be most helpful for you right now?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await sendMessageToAI(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble right now. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg bg-gradient-to-r ${modobot.color} text-white flex items-center justify-center text-2xl transition-all duration-300 hover:shadow-xl`}
        aria-label="Open Modobot"
      >
        {isOpen ? '✕' : modobot.emoji}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${modobot.color} text-white p-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {modobot.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold">{modobot.name}</h3>
                    <p className="text-xs opacity-90">AI Emotional Companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Chat with ${modobot.name}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className={`px-4 py-2 rounded-full text-white transition-colors ${
                    inputMessage.trim() && !isTyping
                      ? `bg-gradient-to-r ${modobot.color} hover:opacity-90`
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  ➤
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomChatbot; 