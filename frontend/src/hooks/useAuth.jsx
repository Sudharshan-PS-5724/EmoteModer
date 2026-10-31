import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const authCheckId = useRef(0);
  const authRequest = useRef(null);
  const checkAuth = useCallback(async (nextFirebaseUser = auth.currentUser) => {
    const checkId = ++authCheckId.current;
    authRequest.current?.abort();
    const request = new AbortController();
    authRequest.current = request;
    setFirebaseUser(nextFirebaseUser);
    setAuthError('');

    if (!nextFirebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/user', { signal: request.signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Your account could not be loaded.');
      if (checkId === authCheckId.current) setUser(body);
    } catch (error) {
      if (checkId === authCheckId.current) {
        setUser(null);
        setAuthError(error.message || 'Sign-in could not be completed. Check the backend and Firebase Admin setup.');
      }
    } finally {
      if (checkId === authCheckId.current) setLoading(false);
    }
  }, []);

  const login = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      let signInError = error;
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Google sign-in redirect failed:', redirectError);
          signInError = redirectError;
        }
      }
      const messages = {
        'auth/popup-blocked': 'Allow popups for this site, then try again.',
        'auth/unauthorized-domain': 'Add this site to Firebase Authentication’s authorized domains.',
        'auth/operation-not-allowed': 'Enable Google sign-in in Firebase Authentication.',
        'auth/configuration-not-found': 'Firebase cannot find Authentication for this web configuration. Copy a fresh Web app config from Firebase Project settings, enable Authentication and Google sign-in, then restart the Vite server.',
        'auth/popup-closed-by-user': 'Sign-in was closed before it finished.'
      };
      setAuthError(messages[signInError.code] || 'Google sign-in could not start. Check Firebase Authentication settings.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  useEffect(() => {
    // Firebase remains the source of truth across refreshes and browser tabs.
    const unsubscribe = onAuthStateChanged(auth, checkAuth);
    return () => { unsubscribe(); authRequest.current?.abort(); authCheckId.current += 1; };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, authError, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
