import React from 'react';
import { motion } from 'framer-motion';
import { useMood } from '../context/MoodContext.jsx';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config.js';

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

const moodCardStyles = {
  happy: 'bg-mood-happy-primary/20 border-mood-happy-primary',
  sad: 'bg-mood-sad-primary/20 border-mood-sad-primary',
  angry: 'bg-mood-angry-primary/20 border-mood-angry-primary',
  fear: 'bg-mood-fear-primary/20 border-mood-fear-primary',
  disgust: 'bg-mood-disgust-primary/20 border-mood-disgust-primary',
  surprise: 'bg-mood-surprise-primary/20 border-mood-surprise-primary',
};

const MoodBoard = () => {
  const { currentMood, setCurrentMood, moodList, addMoodToHistory } = useMood();
  const bgClass = moodBgStyles[currentMood] || moodBgStyles.happy;
  const textClass = moodTextStyles[currentMood] || moodTextStyles.happy;
  const cardClass = moodCardStyles[currentMood] || moodCardStyles.happy;
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [emotionAnalysis, setEmotionAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const API_BASE = config.getApiUrl();

  const moods = [
    { name: 'happy', emoji: '😊', description: 'Joyful & Bright' },
    { name: 'sad', emoji: '😢', description: 'Melancholic & Reflective' },
    { name: 'angry', emoji: '😠', description: 'Intense & Passionate' },
    { name: 'fear', emoji: '😨', description: 'Anxious & Cautious' },
    { name: 'disgust', emoji: '🤢', description: 'Repulsed & Disturbed' },
    { name: 'surprise', emoji: '😲', description: 'Amazed & Astonished' }
  ];

  // Tamil-friendly emotion responses
  const tamilEmotionResponses = {
    happy: [
      "Romba nalla irukku macha! 😊 Your mood board is full of positive vibes!",
      "Super ah irukku! This board radiates happiness!",
      "Vaa macha, indha positive energy ah maintain pannanum!",
      "Romba santhosham! Your joy is contagious!"
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

  const getRandomTamilResponse = (emotion) => {
    const responses = tamilEmotionResponses[emotion] || tamilEmotionResponses.happy;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const analyzeMoodBoard = async () => {
    if (!boardTitle.trim() && !boardDescription.trim() && items.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const moodBoardData = {
        title: boardTitle,
        description: boardDescription,
        items: items
      };

      const response = await axios.post(`${API_BASE}/api/analyze-emotion`, {
        text: `${boardTitle} ${boardDescription} ${items.map(item => item.content).join(' ')}`
      }, { withCredentials: true });

      const analysis = {
        emotion: response.data.emotion,
        confidence: response.data.confidence,
        details: response.data.details || {},
        tamilResponse: getRandomTamilResponse(response.data.emotion)
      };

      setEmotionAnalysis(analysis);
      addMoodToHistory(response.data.emotion, response.data.confidence);
      setCurrentMood(response.data.emotion);

    } catch (error) {
      console.error('Error analyzing mood board:', error);
      setEmotionAnalysis({
        emotion: 'neutral',
        confidence: 0.5,
        details: {},
        tamilResponse: "Vaa macha! Let's analyze your mood board together!"
      });
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (boardTitle || boardDescription || items.length > 0) {
      const timeoutId = setTimeout(analyzeMoodBoard, 2000); // Analyze after 2 seconds of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [boardTitle, boardDescription, items]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newItems = files.map((file, index) => ({
      id: Date.now() + index,
      type: 'image',
      content: URL.createObjectURL(file),
      name: file.name
    }));
    setItems([...items, ...newItems]);
  };

  const handleAddText = () => {
    const newItem = {
      id: Date.now(),
      type: 'text',
      content: 'Add your thoughts here...',
      isEditing: true
    };
    setItems([...items, newItem]);
  };

  const handleAddColor = () => {
    const newItem = {
      id: Date.now(),
      type: 'color',
      content: '#FF6B6B'
    };
    setItems([...items, newItem]);
  };

  const handleTextChange = (id, newContent) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content: newContent, isEditing: false } : item
    ));
  };

  const handleColorChange = (id, newColor) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content: newColor } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveBoard = async () => {
    if (!boardTitle.trim()) {
      alert('Please add a title to your mood board');
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await axios.post(`${API_BASE}/api/moodboards`, {
        title: boardTitle,
        description: boardDescription,
        items: items,
        isPublic: false
      }, { withCredentials: true });

      if (response.data) {
        // Update emotion analysis with the detected emotion from the server
        const detectedEmotion = response.data.detectedEmotion || response.data.mood || 'neutral';
        const confidence = response.data.emotionConfidence || 0.8;
        
        setEmotionAnalysis({
          emotion: detectedEmotion,
          confidence: confidence,
          details: response.data.details || {},
          tamilResponse: getRandomTamilResponse(detectedEmotion)
        });
        
        // Update current mood and add to history
        setCurrentMood(detectedEmotion);
        addMoodToHistory(detectedEmotion, confidence);
        
        // Clear the form
        setBoardTitle('');
        setBoardDescription('');
        setItems([]);
        setEmotionAnalysis(null);
      }

      alert('Mood board saved successfully!');
    } catch (error) {
      console.error('Error saving mood board:', error);
      alert('Error saving mood board. Please try again.');
    }
    setIsCreating(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceText = (confidence) => {
    if (confidence > 0.8) return 'High Confidence';
    if (confidence > 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className={`min-h-[80vh] transition-colors duration-500 ${bgClass} ${textClass} px-2 sm:px-6`}>
      {/* Emotion Analysis Display */}
      {emotionAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mood-card glass-effect border-2 ${cardClass} max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto mb-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold">Mood Analysis</h3>
            <div className="text-2xl">{moods.find(m => m.name === emotionAnalysis.emotion)?.emoji}</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Detected Emotion:</span>
              <span className="capitalize font-bold">{emotionAnalysis.emotion}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Confidence:</span>
              <span className={`font-bold ${getConfidenceColor(emotionAnalysis.confidence)}`}>
                {Math.round(emotionAnalysis.confidence * 100)}% ({getConfidenceText(emotionAnalysis.confidence)})
              </span>
            </div>

            {emotionAnalysis.details.intensity && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Intensity:</span>
                <span className="capitalize font-bold">{emotionAnalysis.details.intensity}</span>
              </div>
            )}

            {emotionAnalysis.details.keywords && emotionAnalysis.details.keywords.length > 0 && (
              <div>
                <span className="font-medium">Keywords:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {emotionAnalysis.details.keywords.slice(0, 5).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm italic">"{emotionAnalysis.tamilResponse}"</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mood-card glass-effect border-2 ${cardClass} max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto mb-6`}
        >
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
            <span className="ml-3">Analyzing your mood board...</span>
          </div>
        </motion.div>
      )}

      {/* Mood Board Creation Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`mood-card glass-effect border-2 ${cardClass} max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto mb-8`}
      >
        <h2 className="text-xl sm:text-3xl font-playfair font-bold mb-4">Create Your Mood Board</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder="Give your mood board a title..."
              className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Describe your mood or feelings..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddText}
              className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Text
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Image
            </button>
            <button
              onClick={handleAddColor}
              className="flex-1 py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Add Color
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handleSaveBoard}
            disabled={isCreating}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {isCreating ? 'Saving...' : 'Save Mood Board'}
          </button>
        </div>
      </motion.div>

      {/* Mood Board Items */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto"
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className={`mood-card glass-effect border-2 ${cardClass} relative`}
            >
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              
              {item.type === 'image' && (
                <img src={item.content} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-2" />
              )}
              
              {item.type === 'color' && (
                <div 
                  className="w-full h-32 rounded-lg mb-2 border-2 border-white/30"
                  style={{ backgroundColor: item.content }}
                />
              )}
              
              {item.type === 'text' && (
                <div className="w-full h-32 p-3 bg-white/10 rounded-lg mb-2">
                  {item.isEditing ? (
                    <textarea
                      value={item.content}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      onBlur={() => handleTextChange(item.id, item.content)}
                      className="w-full h-full bg-transparent border-none outline-none resize-none"
                      placeholder="Add your thoughts..."
                    />
                  ) : (
                    <p className="text-sm">{item.content}</p>
                  )}
                </div>
              )}
              
              <div className="text-xs text-white/70">{item.type}</div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MoodBoard; 