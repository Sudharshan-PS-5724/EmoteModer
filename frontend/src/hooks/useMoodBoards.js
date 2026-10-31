import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './useAuth.jsx';

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The moodboard request could not be completed.');
  return data;
}

export const useMoodBoards = () => {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const controller = useRef(null);
  // Ignore late responses after a user changes account, page, or request.
  const generation = useRef(0);

  const fetchBoards = useCallback(async (cursor = null) => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const version = ++generation.current;
    if (!uid) { setBoards([]); setNextCursor(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/moodboards' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), { signal: request.signal });
      const data = await readResponse(response);
      if (version !== generation.current || request.signal.aborted) return;
      setBoards((previous) => cursor ? [...new Map([...previous, ...data].map((board) => [board._id || board.id, board])).values()] : data);
      setNextCursor(response.headers.get('X-Next-Cursor'));
    } catch (err) {
      if (!request.signal.aborted && version === generation.current) setError(err.message);
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    setBoards([]);
    setNextCursor(null);
    fetchBoards();
    return () => { controller.current?.abort(); generation.current += 1; };
  }, [fetchBoards]);

  const createBoard = async (boardData) => {
    controller.current?.abort();
    const version = ++generation.current;
    setLoading(true); setError(null);
    try {
      const board = await readResponse(await apiFetch('/api/moodboards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(boardData)
      }));
      if (version === generation.current) setBoards((previous) => [board, ...previous.filter((entry) => entry._id !== board._id)]);
      return board;
    } catch (err) {
      if (version === generation.current) setError(err.message);
      throw err;
    } finally { if (version === generation.current) setLoading(false); }
  };

  const deleteBoard = async (boardId) => {
    if (!boardId) throw new Error('Board ID is required');
    controller.current?.abort();
    const version = ++generation.current;
    setLoading(true); setError(null);
    try {
      await readResponse(await apiFetch('/api/moodboards/' + encodeURIComponent(boardId), { method: 'DELETE' }));
      if (version === generation.current) setBoards((previous) => previous.filter((board) => (board._id || board.id) !== boardId));
      return true;
    } catch (err) {
      if (version === generation.current) setError(err.message);
      throw err;
    } finally { if (version === generation.current) setLoading(false); }
  };

  const getBoard = async (boardId) => readResponse(await apiFetch('/api/moodboards/' + encodeURIComponent(boardId)));
  return { boards, loading, error, fetchBoards: () => fetchBoards(), createBoard, deleteBoard, getBoard,
    hasMore: Boolean(nextCursor), loadMore: () => nextCursor && !loading ? fetchBoards(nextCursor) : Promise.resolve() };
};
