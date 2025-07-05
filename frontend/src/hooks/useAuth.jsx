import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 