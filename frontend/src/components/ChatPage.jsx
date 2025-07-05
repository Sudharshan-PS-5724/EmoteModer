import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChatRoomSelector from './ChatRoomSelector';
import ChatRoom from './ChatRoom';
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

const ChatPage = () => {
  const { currentMood } = useMood();
  const bgClass = moodBgStyles[currentMood] || moodBgStyles.happy;
  const textClass = moodTextStyles[currentMood] || moodTextStyles.happy;

  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomConfigs = {
    happy: {
      name: 'Happy Room',
      emoji: '😊',
      color: 'from-yellow-400 to-orange-400',
      description: 'Share your joy and positive vibes!'
    },
    sad: {
      name: 'Sad Room',
      emoji: '😢',
      color: 'from-blue-400 to-purple-400',
      description: 'Find comfort and support together'
    },
    angry: {
      name: 'Angry Room',
      emoji: '😠',
      color: 'from-red-400 to-pink-400',
      description: 'Vent and find understanding'
    },
    fear: {
      name: 'Fear Room',
      emoji: '😨',
      color: 'from-gray-400 to-gray-600',
      description: 'Share anxieties and find reassurance'
    },
    disgust: {
      name: 'Disgust Room',
      emoji: '🤢',
      color: 'from-green-400 to-teal-400',
      description: 'Express frustrations and find perspective'
    },
    surprise: {
      name: 'Surprise Room',
      emoji: '😲',
      color: 'from-pink-400 to-purple-400',
      description: 'Share unexpected moments and reactions'
    }
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  return (
    <div className={`min-h-[80vh] transition-colors duration-500 ${bgClass} ${textClass} px-2 sm:px-4`}>
      <div className="container mx-auto px-0 sm:px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            💬 Mood Chat Rooms
          </h1>
          <p className="text-base sm:text-xl text-gray-600">
            Connect with others who share your current emotional state
          </p>
        </motion.div>

        {!selectedRoom ? (
          <ChatRoomSelector 
            selectedRoom={selectedRoom} 
            onRoomSelect={handleRoomSelect} 
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-4">
              <button
                onClick={handleBackToRooms}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                <span>←</span>
                <span>Back to Rooms</span>
              </button>
            </div>
            
            <ChatRoom
              roomId={selectedRoom}
              roomName={roomConfigs[selectedRoom].name}
              roomEmoji={roomConfigs[selectedRoom].emoji}
              roomColor={roomConfigs[selectedRoom].color}
            />
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 max-w-xs sm:max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">💬 How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
              <div>
                <div className="font-medium mb-1">🎯 Choose Your Mood</div>
                <div>Pick a room that matches how you're feeling right now</div>
              </div>
              <div>
                <div className="font-medium mb-1">💭 Share & Connect</div>
                <div>Chat with others who are in the same emotional space</div>
              </div>
              <div>
                <div className="font-medium mb-1">🔄 Daily Reset</div>
                <div>Messages are cleaned up daily to keep conversations fresh</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage; 