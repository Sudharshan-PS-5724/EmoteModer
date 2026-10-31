import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BoardPieces from './BoardPieces';
import { apiFetch } from '../lib/api';

const moods = {
  happy: ['Bright', 'sun'],
  sad: ['Soft', 'blue'],
  angry: ['Bold', 'coral'],
  fear: ['Uncertain', 'slate'],
  disgust: ['Over it', 'green'],
  surprise: ['A plot twist', 'pink'],
  neutral: ['Open', 'slate'],
};

const moodMarks = { sun: '✳', blue: '◒', coral: 'ϟ', green: '↗', pink: '✦', slate: '⌁' };

function GalleryBoard({ board }) {
  const [label, tone] = moods[board.mood || board.detectedEmotion] || moods.neutral;
  const items = board.items || [];

  return (
    <article className="board-card">
      <div className={`board-art tone-${tone}`}>
        <BoardPieces items={items} />
        {!items.length && (
          <>
            <span className="art-orbit orbit-one" />
            <span className="art-orbit orbit-two" />
            <span className="art-glyph">{moodMarks[tone]}</span>
            <span className="art-caption">A feeling, collected</span>
          </>
        )}
      </div>
      <div className="board-card-body">
        <div className="board-meta">
          <span className={`mood-tag tone-${tone}`}>{label}</span>
          <span>Shared with care</span>
        </div>
        <h3>{board.title}</h3>
        <p className="board-description">{board.description || 'A little space for this moment.'}</p>
        <div className="board-footer">
          <span>
            {board.itemCount ?? items.length} pieces ·{' '}
            {board.createdAt
              ? new Date(board.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'Recently'}
          </span>
          <span>EmoteModer community</span>
        </div>
      </div>
    </article>
  );
}

export default function PublicGallery() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBoards() {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch('/api/moodboards/public' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), { signal: controller.signal, authenticated: false });
        if (!response.ok) throw new Error('The gallery is taking a quiet moment. Please try again.');
        const data = await response.json();
        if (controller.signal.aborted) return;
        setBoards((previous) => cursor ? [...new Map([...previous, ...data].map((board) => [board._id || board.id, board])).values()] : data);
        setNextCursor(response.headers.get('X-Next-Cursor'));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadBoards();
    return () => controller.abort();
  }, [attempt, cursor]);

  return (
    <main className="gallery-page">
      <div className="gallery-shell">
        <div className="gallery-heading">
          <div>
            <p className="eyebrow">A COMMUNITY OF FEELINGS</p>
            <h1>Little things<br /><span>we’ve collected.</span></h1>
            <p>Public moodboards, shared by people figuring it out as they go.</p>
          </div>
          <Link to="/login" className="button-primary">Make your own <span>↗</span></Link>
        </div>

        {error && (
          <section className="gallery-error-state" role="alert">
            <span className="gallery-error-mark" aria-hidden="true">⌁</span>
            <div>
              <h2>The gallery is out for a breather.</h2>
              <p>{error}</p>
            </div>
            <button className="button-primary" type="button" onClick={() => setAttempt((value) => value + 1)}>
              Try again <span>↻</span>
            </button>
          </section>
        )}

        {loading && <div className="loading-state"><span className="loader-dot" /> Finding the good stuff…</div>}
        {!loading && !error && boards.length === 0 && (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true"><span>✳</span><span>▧</span><span>◒</span></div>
            <h3>The gallery is just getting started</h3>
            <p>Be the first to share a moodboard with the community.</p>
            <Link className="button-primary" to="/login">Create a moodboard <span>↗</span></Link>
          </div>
        )}
        {!loading && !error && boards.length > 0 && (
          <div className="boards-grid">{boards.map((board) => <GalleryBoard key={board._id || board.id} board={board} />)}</div>
        )}

        {!loading && !error && nextCursor && <button className="button-primary" onClick={() => setCursor(nextCursor)}>Load more moodboards</button>}
        <div className="gallery-footer">
          <Link to="/">← Back to EmoteModer</Link>
          <span>EVERY FEELING HAS A PLACE HERE</span>
        </div>
      </div>
    </main>
  );
}
