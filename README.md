# 🎭 Emote Moder - Advanced Emotion Recognition Platform

A revolutionary emotion recognition platform that combines cutting-edge AI technology with intuitive design. Express, analyze, and understand your feelings with advanced NLP models and Tamil-friendly interactions.

## ✨ Features

### 🧠 AI-Powered Emotion Recognition
- **Hugging Face NLP Models**: Advanced sentiment analysis using state-of-the-art language models
- **Real-time Analysis**: Instant emotion detection from text and mood boards
- **Confidence Scoring**: Get detailed confidence levels for each emotion detection
- **Multi-emotion Support**: Happy, Sad, Angry, Fear, Disgust, Surprise
- **Keyword Extraction**: Identify key emotional triggers in your content

### 📊 Real-time Analytics
- **Live Mood Tracking**: Real-time updates to your emotional history
- **Visual Emotion Dashboard**: Beautiful charts and statistics
- **Public Mood Boards**: Share and discover emotions from the community
- **Emotion Patterns**: Identify trends in your emotional well-being

### 🎨 Mood-Adaptive Design
- **Dynamic Fonts**: Each emotion has its own unique font family
- **Color-coded Interface**: Complete UI adaptation based on current mood
- **Animated Transitions**: Smooth mood-based animations and effects
- **Responsive Design**: Perfect experience on all devices

### 💬 Smart Chatbot with Tamil Touch
- **Hamburger-style Interface**: Clean, accessible chat interface
- **Emotion-aware Responses**: AI responses tailored to your emotional state
- **Tamil-friendly Interactions**: Friendly responses with regional slang like "Vaa macha!"
- **Mood History Access**: Get insights into your emotional journey

### 🎯 Enhanced Mood Board Analysis
- **Real-time Emotion Detection**: Analyze mood boards as you create them
- **Confidence Scoring**: See how confident the AI is about detected emotions
- **Keyword Analysis**: Identify emotional triggers in your content
- **Intensity Levels**: Understand the strength of detected emotions
- **Tamil-friendly Feedback**: Get encouraging responses in Tamil slang

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- JWT Secret (for authentication)
- OpenRouter API key (for custom chatbot)

### Environment Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd ama
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Set up environment variables:**

Create `.env` files in both `frontend/` and `backend/` directories:

**Backend (.env):**
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
HUGGING_FACE_API_KEY=your_hugging_face_api_key_optional
```

**Frontend (.env):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_optional
```

### API Keys Setup

#### OpenRouter API Key (for Modobot Chatbot)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get your API key
3. Add it to `frontend/.env` as `VITE_OPENROUTER_API_KEY`
4. **Note**: Modobot works with intelligent fallback responses even without the API key

#### Hugging Face API Key (for Better Emotion Detection)
1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account and get your API key
3. Add it to `backend/.env` as `HUGGING_FACE_API_KEY` or `HUGGINGFACE_API_KEY`
4. **Note**: The app works with fallback analysis without this key, but Hugging Face provides more accurate emotion detection

**Important**: The Hugging Face API key is optional but recommended for better emotion analysis. Without it, the app uses a basic sentiment analysis fallback.

### Running the App

```bash
# Start both frontend and backend
npm run dev

# Or run separately:
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm run dev
```

Visit `http://localhost:5173` to use the app!

## 🎯 How It Works

### Emotion Recognition Flow
1. **Text Input**: User creates mood boards or chats
2. **AI Analysis**: Hugging Face models analyze text for emotions
3. **Confidence Scoring**: System provides confidence levels
4. **Real-time Updates**: Mood history updates instantly
5. **Tamil-friendly Response**: Get encouraging feedback with regional slang

### Mood Board Creation & Analysis
1. **Create Board**: Add title, description, and content items
2. **Real-time Analysis**: System automatically detects emotions as you type
3. **Confidence Display**: See how confident the AI is about the emotion
4. **Keyword Extraction**: Identify emotional triggers in your content
5. **Tamil Feedback**: Get friendly responses like "Romba nalla irukku macha!"
6. **Public Sharing**: Optionally share with the community

### Chatbot Interaction
1. **Open Chat**: Click the hamburger menu button
2. **Share Feelings**: Type your thoughts and emotions
3. **AI Response**: Get emotion-aware responses with Tamil slang
4. **Mood Tracking**: All interactions update your mood history

## 🎨 Emotion Categories

| Emotion | Emoji | Description | Font Family |
|---------|-------|-------------|-------------|
| Happy | 😊 | Joyful & Bright | Comic Sans MS |
| Sad | 😢 | Melancholic & Reflective | Georgia |
| Angry | 😠 | Intense & Passionate | Impact |
| Fear | 😨 | Anxious & Cautious | Courier New |
| Disgust | 🤢 | Repulsed & Disturbed | Arial Black |
| Surprise | 😲 | Amazed & Astonished | Brush Script MT |

## 🔧 Technical Stack

### Frontend
- **React 18** with Vite
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT Authentication** for secure authentication
- **Redis** for caching (optional)
- **Hugging Face API** for NLP
- **OpenRouter API** for chatbot responses

### AI & ML
- **Hugging Face Transformers**: State-of-the-art NLP models
- **Emotion Classification**: Multi-label emotion detection
- **Confidence Scoring**: Probabilistic emotion analysis
- **Real-time Processing**: Instant emotion recognition
- **Keyword Extraction**: Identify emotional triggers

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile phones (320px+)
- 📱 Large phones (475px+)
- 💻 Tablets (768px+)
- 🖥️ Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🚀 Deployment

### 🎯 Vercel + Render + Redis Setup

We recommend using **Vercel** for frontend and **Render** for backend + Redis for optimal performance and scalability.

#### **Quick Deployment**
```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

#### **Manual Deployment Steps**

**1. Backend (Render)**
- Create account at [render.com](https://render.com)
- Connect GitHub repository
- Create Web Service (backend folder)
- Add environment variables:
  ```env
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emotemoder
  SESSION_SECRET=your_super_secret_session_key_here
  OPENROUTER_API_KEY=sk-or-your-openrouter-key
  HUGGINGFACE_API_KEY=hf_your_huggingface_key
  NODE_ENV=production
  ```

**2. Redis (Render)**
- Create Redis service in Render
- Add `REDIS_URL` to backend environment variables

**3. Frontend (Vercel)**
- Create account at [vercel.com](https://vercel.com)
- Import GitHub repository
- Configure as Vite project (frontend folder)
- Add environment variable:
  ```env
  VITE_API_BASE=https://your-backend-url.onrender.com
  ```

#### **Detailed Guide**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Environment Variables
Make sure to set all environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email hello@emotemoder.com or create an issue in the repository.

---

**Emote Moder** - Where AI meets emotion, and technology understands feelings with a friendly Tamil touch! 🎭✨ 