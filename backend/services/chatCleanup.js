const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config (you'll need to add this to your .env file)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class ChatCleanupService {
  constructor() {
    this.isRunning = false;
  }

  // Clean up messages older than 24 hours
  async cleanupOldMessages() {
    if (this.isRunning) {
      console.log('Cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting daily chat cleanup...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get all chat rooms
      const rooms = ['happy', 'calm', 'energetic', 'reflective', 'peaceful', 'creative'];
      
      let totalDeleted = 0;

      for (const roomId of rooms) {
        const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
        const q = query(messagesRef, where('timestamp', '<', yesterday));
        
        const querySnapshot = await getDocs(q);
        const deletePromises = [];

        querySnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });

        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
          totalDeleted += deletePromises.length;
          console.log(`Deleted ${deletePromises.length} messages from ${roomId} room`);
        }
      }

      console.log(`Chat cleanup completed! Total messages deleted: ${totalDeleted}`);
      
      // Also clean up typing status (older than 5 minutes)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      for (const roomId of rooms) {
        const typingRef = collection(db, `chatRooms/${roomId}/typing`);
        const typingQuery = query(typingRef, where('timestamp', '<', fiveMinutesAgo));
        
        const typingSnapshot = await getDocs(typingQuery);
        const typingDeletePromises = [];

        typingSnapshot.forEach((doc) => {
          typingDeletePromises.push(deleteDoc(doc.ref));
        });

        if (typingDeletePromises.length > 0) {
          await Promise.all(typingDeletePromises);
          console.log(`Cleaned up ${typingDeletePromises.length} stale typing indicators from ${roomId} room`);
        }
      }

    } catch (error) {
      console.error('Error during chat cleanup:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Start the cleanup scheduler
  startScheduler() {
    // Run cleanup every day at 2 AM
    const scheduleCleanup = () => {
      const now = new Date();
      const nextRun = new Date();
      nextRun.setHours(2, 0, 0, 0); // 2 AM
      
      if (now > nextRun) {
        nextRun.setDate(nextRun.getDate() + 1); // Tomorrow
      }
      
      const timeUntilNextRun = nextRun.getTime() - now.getTime();
      
      setTimeout(async () => {
        await this.cleanupOldMessages();
        scheduleCleanup(); // Schedule next run
      }, timeUntilNextRun);
      
      console.log(`Next chat cleanup scheduled for: ${nextRun.toLocaleString()}`);
    };

    // Start the scheduler
    scheduleCleanup();
    
    // Also run cleanup on startup if it's been more than 24 hours since last run
    this.checkAndRunCleanup();
  }

  // Check if cleanup is needed on startup
  async checkAndRunCleanup() {
    try {
      // Check if we have any messages older than 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const messagesRef = collection(db, 'chatRooms/happy/messages');
      const q = query(messagesRef, where('timestamp', '<', yesterday));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('Found old messages on startup, running cleanup...');
        await this.cleanupOldMessages();
      }
    } catch (error) {
      console.error('Error checking for cleanup on startup:', error);
    }
  }

  // Manual cleanup trigger (for testing or admin use)
  async manualCleanup() {
    console.log('Manual cleanup triggered');
    await this.cleanupOldMessages();
  }
}

module.exports = ChatCleanupService; 