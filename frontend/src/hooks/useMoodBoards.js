import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useMoodBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/moodboards`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(boardData)
      });
      
      if (response.ok) {
        const newBoard = await response.json();
        setBoards(prev => [...prev, newBoard]);
        return newBoard;
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
        credentials: 'include'
      });
      
      if (response.ok) {
        // Fix: Use _id instead of id for MongoDB documents, handle both cases
        setBoards(prev => prev.filter(board => {
          const boardIdToCheck = board._id || board.id;
          return boardIdToCheck !== boardId;
        }));
        return true;
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
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
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