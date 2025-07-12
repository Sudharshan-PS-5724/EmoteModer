/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        // Primary font
        'mango': ['Mango Grotesque', 'system-ui', 'sans-serif'],
        
        // Base fonts
        'poppins': ['Poppins', 'system-ui', 'sans-serif'],
        'montserrat': ['Montserrat', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        
        // Mood-specific fonts
        'mood-happy': ['Inter', 'system-ui', 'sans-serif'],
        'mood-sad': ['Merriweather', 'Georgia', 'serif'],
        'mood-angry': ['Roboto Condensed', 'system-ui', 'sans-serif'],
        'mood-fear': ['Source Code Pro', 'monospace'],
        'mood-disgust': ['Open Sans', 'system-ui', 'sans-serif'],
        'mood-surprise': ['Poppins', 'system-ui', 'sans-serif'],
        
        // Legacy fonts (keeping for compatibility)
        'comic': ['Comic Sans MS', 'cursive'],
        'georgia': ['Georgia', 'serif'],
        'impact': ['Impact', 'fantasy'],
        'courier': ['Courier New', 'monospace'],
        'arial-black': ['Arial Black', 'sans-serif'],
        'brush': ['Brush Script MT', 'cursive'],
      },
      colors: {
        // New emotion-based colors
        'mood-happy-primary': '#FFD93D',
        'mood-happy-secondary': '#FF6B6B',
        'mood-happy-accent': '#4ECDC4',
        'mood-happy-background': '#FFF8E1',
        'mood-happy-text': '#2C3E50',
        
        'mood-sad-primary': '#6C5CE7',
        'mood-sad-secondary': '#A29BFE',
        'mood-sad-accent': '#74B9FF',
        'mood-sad-background': '#F0F2F5',
        'mood-sad-text': '#2C3E50',
        
        'mood-angry-primary': '#E17055',
        'mood-angry-secondary': '#FF7675',
        'mood-angry-accent': '#FDCB6E',
        'mood-angry-background': '#FFF5F5',
        'mood-angry-text': '#2C3E50',
        
        'mood-fear-primary': '#2D3436',
        'mood-fear-secondary': '#636E72',
        'mood-fear-accent': '#B2BEC3',
        'mood-fear-background': '#F8F9FA',
        'mood-fear-text': '#2C3E50',
        
        'mood-disgust-primary': '#00B894',
        'mood-disgust-secondary': '#55A3FF',
        'mood-disgust-accent': '#81ECEC',
        'mood-disgust-background': '#F0FFF4',
        'mood-disgust-text': '#2C3E50',
        
        'mood-surprise-primary': '#FD79A8',
        'mood-surprise-secondary': '#FDCB6E',
        'mood-surprise-accent': '#6C5CE7',
        'mood-surprise-background': '#FFF0F5',
        'mood-surprise-text': '#2C3E50',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        }
      }
    },
  },
  plugins: [],
} 