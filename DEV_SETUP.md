# Development Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Frontend and Backend
```bash
npm run dev
```

This will start:
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:5000` (Express server with nodemon)

## Available Scripts

### Root Level Scripts
```bash
# Start both frontend and backend (recommended)
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Install all dependencies
npm run install:all

# Build frontend for production
npm run build

# Start backend in production mode
npm start
```

### Individual Scripts
```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev
```

## Environment Variables

### Backend (.env)
```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=5000
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:5000
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_optional
```

## Development Workflow

1. **Start Development Servers**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Health Check: `http://localhost:5000/health`

3. **Authentication Testing**
   - Use the debug components on the frontend
   - Test with existing user: `Virat_Kohli` / `password123`
   - Or register a new user

4. **Hot Reload**
   - Frontend: Vite provides instant hot reload
   - Backend: Nodemon automatically restarts on file changes

## Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change backend port in .env
PORT=5001
```

### Frontend Can't Connect to Backend
1. Check if backend is running on port 5000
2. Verify `VITE_API_BASE` in frontend `.env`
3. Check CORS settings in backend

### Authentication Issues
1. Check browser console for errors
2. Verify JWT secrets are set in backend `.env`
3. Use debug components to monitor auth state

## File Structure
```
ama/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── package.json       # Root scripts
└── DEV_SETUP.md      # This file
```

## Production Deployment
```bash
# Build frontend
npm run build

# Start production backend
npm start
```

The development environment is now set up for concurrent development with hot reload for both frontend and backend! 🚀 