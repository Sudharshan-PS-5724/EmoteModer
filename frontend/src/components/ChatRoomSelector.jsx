import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';

const ChatRoomSelector = ({ selectedRoom, onRoomSelect }) => {
  const { user } = useAuth();

  const moodRooms = [
    {
      id: 'happy',
      name: 'Happy Room',
      emoji: '😊',
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Share your joy and positive vibes!'
    },
    {
      id: 'sad',
      name: 'Sad Room',
      emoji: '😢',
      color: 'from-blue-400 to-purple-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Find comfort and support together'
    },
    {
      id: 'angry',
      name: 'Angry Room',
      emoji: '😠',
      color: 'from-red-400 to-pink-400',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Vent and find understanding'
    },
    {
      id: 'fear',
      name: 'Fear Room',
      emoji: '😨',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Share anxieties and find reassurance'
    },
    {
      id: 'disgust',
      name: 'Disgust Room',
      emoji: '🤢',
      color: 'from-green-400 to-teal-400',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Express frustrations and find perspective'
    },
    {
      id: 'surprise',
      name: 'Surprise Room',
      emoji: '😲',
      color: 'from-pink-400 to-purple-400',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      description: 'Share unexpected moments and reactions'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Mood Room
        </h2>
        <p className="text-gray-600">
          Join a conversation that matches your current mood
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moodRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRoomSelect(room.id)}
            className={`
              cursor-pointer rounded-xl p-4 border-2 transition-all duration-300
              ${selectedRoom === room.id 
                ? `${room.borderColor} bg-gradient-to-r ${room.color} text-white shadow-lg` 
                : `${room.bgColor} ${room.borderColor} hover:shadow-md`
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{room.emoji}</div>
              <div className="flex-1">
                <h3 className={`font-semibold ${selectedRoom === room.id ? 'text-white' : 'text-gray-800'}`}>
                  {room.name}
                </h3>
                <p className={`text-sm ${selectedRoom === room.id ? 'text-white/80' : 'text-gray-600'}`}>
                  {room.description}
                </p>
              </div>
              {selectedRoom === room.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Removed storage tip section */}
    </div>
  );
};

export default ChatRoomSelector; 