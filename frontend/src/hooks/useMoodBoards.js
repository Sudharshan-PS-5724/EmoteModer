import { useState, useEffect } from 'react';
import { config } from '../config.js';

const API_BASE = config.getApiUrl();

export const useMoodBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/moodboards`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      } else if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to fetch mood boards');
      }
    } catch (err) {
      console.error('Error fetching mood boards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (boardData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/moodboards`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(boardData)
      });
      
      if (response.ok) {
        const newBoard = await response.json();
        setBoards(prev => [...prev, newBoard]);
        return newBoard;
      } else if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to create mood board');
      }
    } catch (err) {
      console.error('Error creating mood board:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (boardId) => {
    if (!boardId) {
      console.error('Board ID is required for deletion');
      throw new Error('Board ID is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/moodboards/${boardId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        // Fix: Use _id instead of id for MongoDB documents, handle both cases
        setBoards(prev => prev.filter(board => {
          const boardIdToCheck = board._id || board.id;
          return boardIdToCheck !== boardId;
        }));
        return true;
      } else if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Authentication required');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete mood board');
      }
    } catch (err) {
      console.error('Error deleting mood board:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBoard = async (boardId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/moodboards/${boardId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to fetch mood board');
      }
    } catch (err) {
      console.error('Error fetching mood board:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    deleteBoard,
    getBoard
  };
}; 