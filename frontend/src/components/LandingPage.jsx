import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useMood } from '../context/MoodContext.jsx';

// Floating Emoji Particle Component
const FloatingEmoji = ({ emoji, delay, duration, x, y }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [y, y - 100, y - 200],
        x: [x, x + Math.random() * 50 - 25, x + Math.random() * 100 - 50]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none text-2xl sm:text-3xl md:text-4xl z-0"
      style={{ left: x, top: y }}
    >
      {emoji}
    </motion.div>
  );
};

const LandingPage = () => {
  const { currentMood, setCurrentMood } = useMood();
  const parallaxRef = useRef(null);
  const { scrollY } = useScroll({ container: parallaxRef });
  const [particles, setParticles] = useState([]);
  
  // Parallax transforms for backgrounds
  const y1 = useTransform(scrollY, [0, 600], [0, 100]);
  const y2 = useTransform(scrollY, [0, 600], [0, -80]);
  const y3 = useTransform(scrollY, [0, 600], [0, 60]);

  const emotions = [
    { name: 'happy', emoji: '😊', description: 'Joyful & Bright', color: 'from-yellow-400 to-orange-400' },
    { name: 'sad', emoji: '😢', description: 'Melancholic & Reflective', color: 'from-blue-400 to-purple-400' },
    { name: 'angry', emoji: '😠', description: 'Intense & Passionate', color: 'from-red-400 to-pink-400' },
    { name: 'fear', emoji: '😨', description: 'Anxious & Cautious', color: 'from-gray-400 to-gray-600' },
    { name: 'disgust', emoji: '🤢', description: 'Repulsed & Disturbed', color: 'from-green-400 to-teal-400' },
    { name: 'surprise', emoji: '😲', description: 'Amazed & Astonished', color: 'from-pink-400 to-purple-400' }
  ];

  // Generate floating emoji particles
  useEffect(() => {
    const emojis = ['😊', '😢', '😠', '😨', '🤢', '😲'];
    const newParticles = [];
    
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4
      });
    }
    
    setParticles(newParticles);
  }, []);

  // Function to get mood classes
  const getMoodClasses = (moodName) => {
    const classes = {
      happy: {
        primary: 'bg-mood-happy-primary',
        secondary: 'bg-mood-happy-secondary',
        accent: 'bg-mood-happy-accent',
        text: 'text-mood-happy-text'
      },
      sad: {
        primary: 'bg-mood-sad-primary',
        secondary: 'bg-mood-sad-secondary',
        accent: 'bg-mood-sad-accent',
        text: 'text-mood-sad-text'
      },
      angry: {
        primary: 'bg-mood-angry-primary',
        secondary: 'bg-mood-angry-secondary',
        accent: 'bg-mood-angry-accent',
        text: 'text-mood-angry-text'
      },
      fear: {
        primary: 'bg-mood-fear-primary',
        secondary: 'bg-mood-fear-secondary',
        accent: 'bg-mood-fear-accent',
        text: 'text-mood-fear-text'
      },
      disgust: {
        primary: 'bg-mood-disgust-primary',
        secondary: 'bg-mood-disgust-secondary',
        accent: 'bg-mood-disgust-accent',
        text: 'text-mood-disgust-text'
      },
      surprise: {
        primary: 'bg-mood-surprise-primary',
        secondary: 'bg-mood-surprise-secondary',
        accent: 'bg-mood-surprise-accent',
        text: 'text-mood-surprise-text'
      }
    };
    return classes[moodName] || classes.happy;
  };

  const currentMoodClasses = getMoodClasses(currentMood);

  return (
    <div ref={parallaxRef} className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Floating Emoji Particles */}
      {particles.map(particle => (
        <FloatingEmoji
          key={particle.id}
          emoji={particle.emoji}
          delay={particle.delay}
          duration={particle.duration}
          x={particle.x}
          y={particle.y}
        />
      ))}

      {/* Parallax Animated Background */}
      <motion.div style={{ y: y1 }} className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl z-0 opacity-30" />
      <motion.div style={{ y: y2 }} className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl z-0 opacity-30" />
      <motion.div style={{ y: y3 }} className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-xl z-0 opacity-30" />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-8"
          >
            <div className="text-8xl sm:text-9xl mb-4">🎭</div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
          >
            Emote Moder
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-8 max-w-3xl mx-auto font-light"
          >
            Where emotions meet intelligence. 
            <span className="block text-purple-600 font-semibold">Express, analyze, and understand your feelings.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🚀 Start Your Journey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-purple-200 px-8 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              📚 Learn More
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { number: '6', label: 'Emotions' },
              { number: 'AI', label: 'Powered' },
              { number: '∞', label: 'Possibilities' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI Emotion Recognition',
                description: 'Advanced NLP models analyze your emotions with 95% accuracy',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: '🎤',
                title: 'Voice Assistant',
                description: 'Natural voice responses that adapt to your emotional state',
                gradient: 'from-pink-500 to-red-500'
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Track your emotional patterns with live mood history',
                gradient: 'from-green-500 to-teal-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`text-6xl mb-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Emotions Section */}
      <section className="py-20 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Your Emotions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {emotions.map((emotion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setCurrentMood(emotion.name)}
              >
                <div className="text-6xl mb-4">{emotion.emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                </h3>
                <p className="text-gray-600">
                  {emotion.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            About Emote Moder
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Emote Moder is a revolutionary emotion recognition platform that combines cutting-edge AI technology with intuitive design. 
            Our advanced NLP models analyze your emotions in real-time, providing personalized insights into your mental well-being.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { number: '95%', label: 'Accuracy Rate' },
              { number: '24/7', label: 'AI Support' },
              { number: '100%', label: 'Privacy Focused' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of users who are already exploring their emotions with Emote Moder.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 text-2xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🚀 Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage; 
