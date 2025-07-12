# 🚀 Emote Moder Deployment Guide
## Vercel + Render + Redis Setup

---

## 📋 Prerequisites

### **Required Accounts**
- [GitHub](https://github.com) - Repository hosting
- [Render](https://render.com) - Backend & Redis hosting
- [Vercel](https://vercel.com) - Frontend hosting
- [MongoDB Atlas](https://mongodb.com/atlas) - Database
- [OpenRouter](https://openrouter.ai) - AI API (Free tier available)
- [Hugging Face](https://huggingface.co) - Sentiment Analysis API

### **Required API Keys**
```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emotemoder

# Session Security
SESSION_SECRET=your_super_secret_session_key_here

# AI Services
OPENROUTER_API_KEY=sk-or-your-openrouter-key
HUGGINGFACE_API_KEY=hf_your_huggingface_key

# Environment
NODE_ENV=production
```

---

## 🎯 Step 1: Backend Deployment on Render

### **1.1 Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your repository

### **1.2 Deploy Backend Service**
1. **Click "New +" → "Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service:**
   ```
   Name: emotemoder-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free (or paid for production)
   ```

### **1.3 Add Environment Variables**
In Render dashboard → Environment → Add Environment Variables:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emotemoder
SESSION_SECRET=your_super_secret_session_key_here
OPENROUTER_API_KEY=sk-or-your-openrouter-key
HUGGINGFACE_API_KEY=hf_your_huggingface_key
NODE_ENV=production
```

### **1.4 Deploy Backend**
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://emotemoder-backend.onrender.com`

---

## 🎯 Step 2: Redis Setup on Render

### **2.1 Create Redis Service**
1. **Click "New +" → "Redis"**
2. **Configure Redis:**
   ```
   Name: emotemoder-redis
   Database: Redis 7
   Plan: Free (or paid for production)
   ```

### **2.2 Get Redis Connection Details**
- Note the **Internal Database URL** from Render dashboard
- Format: `redis://redistogo:password@host:port`

### **2.3 Update Backend Environment Variables**
Add this to your backend environment variables in Render:
```env
REDIS_URL=redis://redistogo:password@host:port
```

---

## 🎯 Step 3: Frontend Deployment on Vercel

### **3.1 Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### **3.2 Deploy Frontend**
1. **Click "New Project"**
2. **Import your GitHub repository**
3. **Configure the project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### **3.3 Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
```env
VITE_API_BASE=https://your-backend-url.onrender.com
```

### **3.4 Deploy Frontend**
- Click "Deploy"
- Wait for deployment to complete
- Note your frontend URL: `https://emotemoder.vercel.app`

---

## 🔧 Step 4: Production Configuration

### **4.1 JWT Authentication Setup**
1. Generate strong JWT secrets for production:
   ```bash
   # Generate JWT secret (32+ characters)
   openssl rand -base64 32
   
   # Generate refresh token secret
   openssl rand -base64 32
   ```
2. Add the secrets to your backend environment variables:
   ```env
   JWT_SECRET=your_generated_jwt_secret_here
   JWT_REFRESH_SECRET=your_generated_refresh_secret_here
   ```

### **4.2 Update CORS Settings**
The backend is already configured to handle production CORS. If you need to add more domains, update the `corsOptions` in `backend/index.js`.

### **4.3 Health Check**
Test your deployment:
```bash
# Backend health check
curl https://emotemoder-backend.onrender.com/health

# Frontend should load at
https://emotemoder.vercel.app
```

---

## 🚀 Step 5: Monitoring & Maintenance

### **5.1 Render Monitoring**
- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Auto-scaling**: Configure for production traffic

### **5.2 Vercel Analytics**
- **Performance**: Monitor Core Web Vitals
- **Analytics**: Track user behavior
- **Edge Functions**: Optimize for global performance

### **5.3 Redis Monitoring**
- **Memory Usage**: Monitor Redis memory consumption
- **Connection Count**: Track active connections
- **Error Rates**: Monitor Redis errors

---

## 🔍 Step 6: Troubleshooting

### **Common Issues**

#### **Backend Issues**
```bash
# Check backend logs
# In Render dashboard → Logs

# Test backend health
curl https://emotemoder-backend.onrender.com/health

# Check environment variables
# In Render dashboard → Environment
```

#### **Frontend Issues**
```bash
# Check build logs
# In Vercel dashboard → Deployments

# Test API connection
# Check browser console for CORS errors
```

#### **Redis Issues**
```bash
# Check Redis connection
# In Render dashboard → Redis → Logs

# Test Redis from backend
curl https://emotemoder-backend.onrender.com/api/health
```

### **Environment Variable Checklist**
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - JWT encryption key
- [ ] `JWT_REFRESH_SECRET` - Refresh token encryption key
- [ ] `OPENROUTER_API_KEY` - AI API key
- [ ] `HUGGINGFACE_API_KEY` - Sentiment analysis key
- [ ] `REDIS_URL` - Redis connection string (optional)
- [ ] `NODE_ENV=production`
- [ ] `VITE_API_BASE` - Backend URL (frontend only)

---

## 📊 Step 7: Performance Optimization

### **7.1 Backend Optimization**
- **Caching**: Redis for session storage
- **Compression**: Enable gzip compression
- **Rate Limiting**: Implement API rate limits
- **CDN**: Use Cloudflare for static assets

### **7.2 Frontend Optimization**
- **Code Splitting**: Lazy load components
- **Image Optimization**: Use WebP format
- **Caching**: Implement service workers
- **PWA**: Add progressive web app features

### **7.3 Database Optimization**
- **Indexes**: Add MongoDB indexes
- **Connection Pooling**: Optimize connections
- **Read Replicas**: Scale read operations

---

## 🔐 Step 8: Security Checklist

### **8.1 Environment Security**
- [ ] Use strong session secrets
- [ ] Enable HTTPS everywhere
- [ ] Set secure cookie flags
- [ ] Implement rate limiting

### **8.2 API Security**
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Implement CORS properly
- [ ] Use environment variables

### **8.3 Data Security**
- [ ] Encrypt sensitive data
- [ ] Regular backups
- [ ] Monitor access logs
- [ ] Implement audit trails

---

## 🎉 Step 9: Go Live!

### **9.1 Final Checklist**
- [ ] All environment variables set
- [ ] JWT secrets configured
- [ ] CORS settings updated
- [ ] Health checks passing
- [ ] SSL certificates active
- [ ] Monitoring enabled

### **9.2 Launch Steps**
1. **Test all features** on production URLs
2. **Monitor logs** for any errors
3. **Check performance** metrics
4. **Verify user flows** work correctly
5. **Announce launch** to users

### **9.3 Post-Launch**
- **Monitor**: Keep an eye on logs and metrics
- **Scale**: Upgrade plans as needed
- **Backup**: Regular database backups
- **Update**: Keep dependencies updated

---

## 📞 Support

### **Getting Help**
- **Render Support**: [render.com/docs](https://render.com/docs)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

### **Useful Commands**
```bash
# Check backend status
curl https://emotemoder-backend.onrender.com/health

# View backend logs
# Render dashboard → Logs

# View frontend build
# Vercel dashboard → Deployments

# Test Redis connection
# Render dashboard → Redis → Connect
```

---

## 🎯 Quick Start Commands

```bash
# 1. Clone repository
git clone https://github.com/yourusername/emotemoder.git
cd emotemoder

# 2. Set up environment variables
# Copy .env.example to .env and fill in your keys

# 3. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# 4. Test locally
# Backend: npm run dev (in backend folder)
# Frontend: npm run dev (in frontend folder)

# 5. Deploy to production
# Follow the deployment steps above
```

---

**🎉 Congratulations! Your Emote Moder app is now deployed and ready for production!** 