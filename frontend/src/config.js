// Configuration file for environment variables
export const config = {
  // API Configuration
  API_BASE: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  
  // OpenRouter API for AI chat
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // Check if we're in production
  isProduction: import.meta.env.PROD || false,
  
  // Get the correct API URL based on environment
  getApiUrl: () => {
    if (import.meta.env.PROD) {
      return 'https://emotemoder.onrender.com';
    }
    return import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  }
}; 