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
        emote: {
          'sunflower-gold': '#e8b343ff',
          eggshell: '#d8dcccff',
          'racing-red': '#f00f1dff',
          'baby-pink': '#faa4c4ff',
          'dusty-denim': '#5a8cd1ff',
          'khaki-beige': '#c1a685ff',
          'wine-plum': '#79333eff',
          'tiger-flame': '#eb6837ff',
          'medium-jungle': '#0d9943ff',
          'deep-space-blue': '#1b3a5aff',
        },
        // New emotion-based colors
        'mood-happy-primary': '#e8b343ff',
        'mood-happy-secondary': '#eb6837ff',
        'mood-happy-accent': '#0d9943ff',
        'mood-happy-background': '#d8dcccff',
        'mood-happy-text': '#1b3a5aff',
        
        'mood-sad-primary': '#5a8cd1ff',
        'mood-sad-secondary': '#1b3a5aff',
        'mood-sad-accent': '#c1a685ff',
        'mood-sad-background': '#d8dcccff',
        'mood-sad-text': '#1b3a5aff',
        
        'mood-angry-primary': '#f00f1dff',
        'mood-angry-secondary': '#eb6837ff',
        'mood-angry-accent': '#e8b343ff',
        'mood-angry-background': '#d8dcccff',
        'mood-angry-text': '#1b3a5aff',
        
        'mood-fear-primary': '#1b3a5aff',
        'mood-fear-secondary': '#79333eff',
        'mood-fear-accent': '#c1a685ff',
        'mood-fear-background': '#d8dcccff',
        'mood-fear-text': '#1b3a5aff',
        
        'mood-disgust-primary': '#0d9943ff',
        'mood-disgust-secondary': '#5a8cd1ff',
        'mood-disgust-accent': '#d8dcccff',
        'mood-disgust-background': '#d8dcccff',
        'mood-disgust-text': '#1b3a5aff',
        
        'mood-surprise-primary': '#faa4c4ff',
        'mood-surprise-secondary': '#e8b343ff',
        'mood-surprise-accent': '#79333eff',
        'mood-surprise-background': '#d8dcccff',
        'mood-surprise-text': '#1b3a5aff',
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
