# Firebase Setup for Chat Cleanup Service

## 🔥 **Firebase Configuration**

To enable the daily chat cleanup service, you need to configure Firebase in your backend.

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `moodboard-me-chat`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **Step 2: Get Firebase Config**

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → "Web" (</>)
4. Register app with name: `mood-backend`
6. Copy the config object

### **Step 3: Add Environment Variables**

Add these to your `backend/.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **Step 4: Enable Firestore Database**

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### **Step 5: Set Up Security Rules**

In Firestore Database → Rules, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to chat rooms
    match /chatRooms/{roomId} {
      allow read, write: if true; // For development
    }
    
    // Allow read/write access to messages
    match /chatRooms/{roomId}/messages/{messageId} {
      allow read, write: if true; // For development
    }
    
    // Allow read/write access to typing indicators
    match /chatRooms/{roomId}/typing/{typingId} {
      allow read, write: if true; // For development
    }
  }
}
```

**⚠️ Note:** These rules allow public access for development. For production, implement proper authentication rules.

## 🧹 **Chat Cleanup Service**

The cleanup service automatically:

- **Deletes messages older than 24 hours** from all 6 mood rooms
- **Cleans up stale typing indicators** (older than 5 minutes)
- **Runs daily at 2 AM** automatically
- **Can be triggered manually** via `/api/admin/cleanup` endpoint

### **Storage Management**

- **Free Tier Limits:** 1GB storage, 50k reads/day, 20k writes/day
- **Daily Cleanup:** Keeps storage usage low
- **Message Lifecycle:** Messages are automatically deleted after 24 hours
- **Typing Indicators:** Cleaned up after 5 minutes of inactivity

### **Manual Cleanup**

To trigger cleanup manually:

```bash
curl -X POST http://localhost:5000/api/admin/cleanup \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

## 📊 **Monitoring**

Check cleanup status in server logs:

```
✅ Chat cleanup service started
Next chat cleanup scheduled for: 2024-01-15 02:00:00
Starting daily chat cleanup...
Deleted 45 messages from happy room
Deleted 23 messages from calm room
Chat cleanup completed! Total messages deleted: 156
```

## 🔧 **Troubleshooting**

### **Firebase Not Configured**
If you see: `⚠️ Firebase not configured, chat cleanup disabled`

**Solution:** Add Firebase environment variables to `.env` file

### **Permission Denied**
If you see: `Error during chat cleanup: Permission denied`

**Solution:** Check Firestore security rules and ensure they allow read/write access

### **Connection Issues**
If you see: `Error during chat cleanup: Network error`

**Solution:** Check internet connection and Firebase project configuration

## 🚀 **Production Considerations**

1. **Security Rules:** Implement proper authentication-based rules
2. **Rate Limiting:** Add rate limiting to cleanup endpoint
3. **Monitoring:** Set up Firebase monitoring and alerts
4. **Backup:** Consider backing up important messages before cleanup
5. **Customization:** Adjust cleanup frequency based on your needs

## 📈 **Scaling Options**

### **Free Tier (Current)**
- 200-300 active chat users/day
- 1GB storage
- Daily cleanup keeps usage low

### **Paid Plans**
- **Blaze Plan:** Pay-as-you-go, higher limits
- **Firestore:** 1GB free, then $0.18/GB/month
- **Real-time Database:** Alternative to Firestore

### **Alternative Solutions**
- **Supabase:** PostgreSQL with real-time features
- **Pusher:** Real-time messaging service
- **Socket.io:** WebSocket-based chat 
