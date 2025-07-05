const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Enhanced contextual responses that actually respond to user messages
const getContextualResponse = (message, emotion) => {
  const lowerMessage = message.toLowerCase();
  
  // Direct responses to user's actual message
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
    return "I'm doing great macha! Thanks for asking! How about you? 😊";
  }
  
  if (lowerMessage.includes('what is your name') || lowerMessage.includes('who are you')) {
    return "I'm Modobot macha! Your AI emotion companion! Nice to meet you! 🎭";
  }
  
  if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
    return "You're welcome macha! Always here to help! 😊";
  }
  
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return "Take care macha! Come back anytime! 👋";
  }
  
  // Respond to specific topics the user mentions
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('office')) {
    if (emotion === 'happy') return "Work is going great macha! Keep that positive energy flowing! 💪";
    if (emotion === 'sad') return "Work stress is real macha. Remember, you're doing your best! Take breaks when needed.";
    if (emotion === 'angry') return "Work can be frustrating macha. Take a deep breath and remember it's temporary.";
    return "Work life can be challenging macha. How's it going for you?";
  }
  
  if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
    if (emotion === 'happy') return "Studies are going well macha! Keep up the good work! 📚";
    if (emotion === 'sad') return "Study stress is tough macha. Take it one step at a time!";
    if (emotion === 'angry') return "Exams can be frustrating macha. You've got this!";
    return "How are your studies going macha? Need any motivation?";
  }
  
  if (lowerMessage.includes('friend') || lowerMessage.includes('family') || lowerMessage.includes('relationship')) {
    if (emotion === 'happy') return "Relationships are beautiful macha! Your happiness shows! ❤️";
    if (emotion === 'sad') return "Relationships can be tough macha. Time heals everything!";
    return "How are your relationships going macha?";
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('sleep') || lowerMessage.includes('exhausted')) {
    return "Rest is important macha! Take care of yourself! Get some good sleep! 😴";
  }
  
  if (lowerMessage.includes('hungry') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return "Food is essential macha! Have a good meal and feel better! 🍕";
  }
  
  if (lowerMessage.includes('success') || lowerMessage.includes('achieved') || lowerMessage.includes('won') || lowerMessage.includes('accomplished')) {
    return "Congratulations macha! You deserve this success! Keep going! 🎉";
  }
  
  if (lowerMessage.includes('fail') || lowerMessage.includes('failed') || lowerMessage.includes('lost')) {
    return "Don't worry macha! Failure is just a stepping stone to success! You'll do better next time!";
  }
  
  if (lowerMessage.includes('money') || lowerMessage.includes('finance') || lowerMessage.includes('salary')) {
    return "Money matters can be stressful macha. Focus on what you can control! 💰";
  }
  
  if (lowerMessage.includes('health') || lowerMessage.includes('sick') || lowerMessage.includes('ill')) {
    return "Health comes first macha! Take care of yourself! 🏥";
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('sunny')) {
    return "Weather affects our mood macha! Hope it's nice where you are! ☀️";
  }
  
  // Respond to emotions the user expresses
  if (lowerMessage.includes('happy') || lowerMessage.includes('joy') || lowerMessage.includes('excited')) {
    return "That's wonderful macha! Your happiness is contagious! Keep spreading that positive energy! 😊";
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    return "I'm sorry you're feeling sad macha. It's okay to feel this way. What's troubling you? I'm here to listen.";
  }
  
  if (lowerMessage.includes('angry') || lowerMessage.includes('mad') || lowerMessage.includes('furious')) {
    return "I understand you're angry macha. Take a deep breath. What happened? Let's talk about it.";
  }
  
  if (lowerMessage.includes('scared') || lowerMessage.includes('afraid') || lowerMessage.includes('fear')) {
    return "Fear is natural macha, but you're stronger than your fears. What's worrying you?";
  }
  
  if (lowerMessage.includes('confused') || lowerMessage.includes('unsure') || lowerMessage.includes('doubt')) {
    return "Confusion is part of life macha. Take your time to figure things out. What's on your mind?";
  }
  
  // Respond to questions
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
    return "That's an interesting question macha! Can you tell me more about what you're thinking?";
  }
  
  // Respond to greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello macha! ${emotion === 'happy' ? 'Great to see you in such a good mood!' : 'How are you feeling today?'}`;
  }
  
  // If user shares something personal, acknowledge it
  if (lowerMessage.length > 20) {
    return "That's interesting macha! Tell me more about that. I'm listening!";
  }
  
  // Default responses based on emotion
  const emotionResponses = {
    happy: [
      "That sounds great macha! Your positive energy is amazing! 😊",
      "Wonderful macha! Keep that good mood going!",
      "I'm happy for you macha! What's making you feel so good?"
    ],
    sad: [
      "I'm sorry you're feeling down macha. What's on your mind?",
      "It's okay to feel sad macha. I'm here to listen.",
      "Don't worry macha, things will get better. What's troubling you?"
    ],
    angry: [
      "I understand you're upset macha. Take a moment to breathe.",
      "Anger is temporary macha. Let's talk about what happened.",
      "Stay calm macha. What's causing this anger?"
    ],
    fear: [
      "Don't be afraid macha! You're stronger than you think.",
      "Fear is just a feeling macha. What's worrying you?",
      "You're not alone macha. What's making you feel unsafe?"
    ],
    disgust: [
      "That sounds unpleasant macha. Let's focus on something better.",
      "Don't let negativity affect you macha. What can we do to change this?",
      "You deserve better vibes macha! What would make you feel better?"
    ],
    surprise: [
      "Wow macha! That's unexpected! Tell me more! 😲",
      "Incredible macha! What's the story behind this?",
      "That's amazing macha! I want to hear everything!"
    ]
  };
  
  const responses = emotionResponses[emotion] || emotionResponses.happy;
  return responses[Math.floor(Math.random() * responses.length)];
};

// Use a free OpenRouter API key (demo key, replace with your own for production)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-free-demo-key';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free OpenRouter models (no cost) - using :free tag models
const FREE_MODELS = [
  'google/gemini-flash-1.5:free',
  'anthropic/claude-3-haiku:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'microsoft/phi-3-mini-4k-instruct:free',
  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
  'openchat/openchat-3.5-0106:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-2:free',
  'google/gemini-pro:free',
  'anthropic/claude-instant-1:free'
];

// Function to get a random free model
const getRandomFreeModel = () => {
  return FREE_MODELS[Math.floor(Math.random() * FREE_MODELS.length)];
};

router.post('/', async (req, res) => {
  const { message, region, emotion, includeTamil } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  
  try {
    // Always use contextual responses for better user experience
    const contextualResponse = getContextualResponse(message, emotion);
    
    // Try AI response first if we have a proper API key
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'sk-or-free-demo-key') {
      try {
        const selectedModel = getRandomFreeModel();
        const systemPrompt = `You are Modobot, a friendly AI companion. Respond in English with Tamil slang like 'macha', 'da', 'super ah irukku', 'romba nalla irukku'. Be empathetic and respond directly to what the user says. Keep responses conversational, supportive, and relevant to their message. Don't be generic - actually respond to their specific message.`;
        
        const response = await axios.post(
          OPENROUTER_URL,
          {
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 150,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const aiReply = response.data.choices?.[0]?.message?.content;
        if (aiReply && aiReply.trim()) {
          return res.json({ reply: aiReply });
        }
      } catch (aiError) {
        console.error('AI response failed, using contextual response:', aiError.message);
      }
    }
    
    // Fallback to contextual response
    res.json({ reply: contextualResponse });
    
  } catch (err) {
    console.error('Chatbot error:', err.message);
    // Final fallback
    const fallbackResponse = getContextualResponse(message, emotion || 'happy');
    res.json({ reply: fallbackResponse });
  }
});

module.exports = router; 