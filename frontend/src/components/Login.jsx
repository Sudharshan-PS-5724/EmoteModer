import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMood } from '../context/MoodContext.jsx';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { currentMood, getMoodGradient, getMoodBgGradient, getMoodBorderColor, getMoodShadowColor } = useMood();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      } else {
        result = await register(formData);
      }

      if (result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getMoodBgGradient(currentMood)} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border ${getMoodBorderColor(currentMood)} ${getMoodShadowColor(currentMood)}`}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎭
          </motion.div>
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${getMoodGradient(currentMood)} bg-clip-text text-transparent font-montserrat tracking-wide`}>
            {isLogin ? 'Welcome Back!' : 'Join Emote Moder'}
          </h1>
          <p className="text-gray-600 mt-2 font-poppins">
            {isLogin ? 'Sign in to continue your emotional journey' : 'Create your account to start expressing emotions'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 font-poppins">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 font-poppins">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
                placeholder="your@email.com"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2 font-poppins">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
              placeholder={isLogin ? "username or email" : "username"}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 font-poppins">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-poppins"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl font-poppins"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${getMoodGradient(currentMood)} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 font-montserrat tracking-wide disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 hover:text-purple-700 font-medium font-poppins"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 