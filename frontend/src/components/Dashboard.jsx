import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMoodBoards } from '../hooks/useMoodBoards';
import { useMood } from '../context/MoodContext.jsx';
import { apiFetch } from '../lib/api';
import BoardPieces from './BoardPieces';

const moods = [
  { id: 'happy', label: 'Feeling lighter', mark: '✳', tone: 'sun' },
  { id: 'sad', label: 'Need a pause', mark: '◒', tone: 'blue' },
  { id: 'angry', label: 'Fired up', mark: 'ϟ', tone: 'coral' },
  { id: 'fear', label: 'Not sure yet', mark: '⌁', tone: 'slate' },
  { id: 'disgust', label: 'Ready to move on', mark: '↗', tone: 'green' },
  { id: 'surprise', label: 'Caught off guard', mark: '✦', tone: 'pink' },
];

function BoardCard({ board, onDelete }) {
  const mood = moods.find((entry) => entry.id === (board.mood || board.detectedEmotion)) || moods[0];
  const detectedMood = moods.find((entry) => entry.id === board.detectedEmotion);
  return (
    <article className="board-card">
      <div className={`board-art tone-${mood.tone}`} aria-hidden="true">
        {board.items?.length ? <BoardPieces items={board.items} /> : <><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-glyph">{mood.mark}</span><span className="art-caption">A feeling, collected</span></>}
      </div>
      <div className="board-card-body">
        <div className="board-meta"><span className={`mood-tag tone-${mood.tone}`}>{mood.label}</span><span>{board.isPublic ? 'Shared' : 'Private'}</span></div>
        <h3>{board.title}</h3>
        <p className="board-description">{board.description || 'A little space for this moment.'}</p>
        {detectedMood && board.detectedEmotion !== board.mood && <p className="board-reflection">Content reflection · {detectedMood.mark} {detectedMood.label}{board.emotionConfidence ? ` · ${Math.round(board.emotionConfidence * 100)}%` : ''}</p>}
        <div className="board-footer"><span>{board.itemCount ?? board.items?.length ?? 0} pieces · {board.createdAt ? new Date(board.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}</span><button className="text-button" onClick={() => onDelete(board._id || board.id)} aria-label={`Delete ${board.title}`}>Remove</button></div>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { boards, loading, error, createBoard, deleteBoard, hasMore, loadMore } = useMoodBoards();
  const { currentMood, setCurrentMood, addMoodToHistory } = useMood();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showEmotionCheck, setShowEmotionCheck] = useState(false);
  const [checkInText, setCheckInText] = useState('');
  const [emotionResult, setEmotionResult] = useState(null);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [emotionError, setEmotionError] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', mood: currentMood || 'happy', isPublic: false, items: [] });
  const addBoardItem = (type) => setFormData((data) => ({ ...data, items: [...data.items, { type, content: type === 'color' ? '#f5df98' : '', name: '' }] }));
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'friend';
  // A ready-to-edit title removes the blank-form barrier for a first board.
  const openCreateForm = () => {
    setFormError('');
    setFormData((data) => ({ ...data, title: data.title || 'A little piece of today', mood: data.mood || currentMood || 'happy' }));
    setShowCreateForm(true);
  };

  async function handleCreateBoard(event) {
    event.preventDefault(); setFormError(''); setSaving(true);
    try {
      const board = await createBoard(formData);
      const mood = board?.mood || formData.mood;
      setCurrentMood(mood); addMoodToHistory(mood, board?.emotionConfidence || 0.8);
      setFormData({ title: '', description: '', mood: 'happy', isPublic: false, items: [] }); setShowCreateForm(false);
    } catch (err) { setFormError(err.message || 'Could not save this board. Try again.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!id || !window.confirm('Remove this moodboard?')) return;
    try { await deleteBoard(id); } catch (err) { setFormError(err.message || 'Could not remove this board.'); }
  }

  async function handleEmotionCheck(event) {
    event.preventDefault();
    const text = checkInText.trim();
    if (!text) { setEmotionError('Write a few words first.'); return; }
    setIsAnalyzingEmotion(true); setEmotionError('');
    try {
      const response = await apiFetch('/api/analyze-emotion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'We could not read that feeling right now.');
      setEmotionResult(data);
    } catch (err) { setEmotionError(err.message || 'We could not read that feeling right now.'); }
    finally { setIsAnalyzingEmotion(false); }
  }

  function useDetectedMood() {
    if (!emotionResult?.emotion) return;
    setCurrentMood(emotionResult.emotion);
    addMoodToHistory(emotionResult.emotion, emotionResult.confidence || 0.5);
  }

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR LITTLE CORNER OF THE INTERNET</p>
            <h1>How are you feeling,<br /><span>{firstName}?</span></h1>
            <p className="welcome-copy">Make a little space for whatever is on your mind.</p>
          </div>
          <div className="today-card"><span className="today-spark">✳</span><span className="today-label">TODAY'S VIBE</span><strong>{moods.find((m) => m.id === currentMood)?.label || 'Open'} energy</strong><span className="today-note">There’s room for every feeling.</span></div>
        </section>

        <section className="quick-actions" aria-label="Quick actions">
          <button className="action-tile action-create" onClick={openCreateForm}><span className="action-icon">＋</span><span><strong>New moodboard</strong><small>Start with a name and add the rest later</small></span><span className="action-arrow">↗</span></button>
          <button className="action-tile action-chat" onClick={() => setShowEmotionCheck((open) => !open)}><span className="action-icon">◌</span><span><strong>Read a feeling</strong><small>Turn a few words into a mood</small></span><span className="action-arrow">↗</span></button>
          <Link className="action-tile action-chat" to="/chat"><span className="action-icon">⌁</span><span><strong>Find your people</strong><small>Drop into a mood room</small></span><span className="action-arrow">↗</span></Link>
          <Link className="action-tile action-gallery" to="/gallery"><span className="action-icon">▧</span><span><strong>Explore the gallery</strong><small>See what others are making</small></span><span className="action-arrow">↗</span></Link>
        </section>

        {showEmotionCheck && <section className="create-panel emotion-checkin" aria-labelledby="emotion-checkin-title">
          <div className="create-panel-heading"><div><p className="eyebrow">A QUICK CHECK-IN</p><h2 id="emotion-checkin-title">What’s sitting with you?</h2></div><button className="icon-button" type="button" onClick={() => setShowEmotionCheck(false)} aria-label="Close feeling check-in">×</button></div>
          <p className="board-description">Write a few words. This reflection is local to EmoteModer and is not a diagnosis.</p>
          <form onSubmit={handleEmotionCheck}>
            <label className="field-label">Your check-in<textarea className="design-input" rows={4} maxLength={4000} value={checkInText} onChange={(event) => setCheckInText(event.target.value)} placeholder="I’m excited about something new, but a little nervous too…" /></label>
            {emotionError && <p className="form-error" role="alert">{emotionError}</p>}
            <button className="button-primary" type="submit" disabled={isAnalyzingEmotion || !checkInText.trim()}>{isAnalyzingEmotion ? 'Reading your words…' : 'Reflect this feeling'} <span>↗</span></button>
          </form>
          {emotionResult && (() => { const detected = moods.find((mood) => mood.id === emotionResult.emotion) || { label: 'Neutral', mark: '○', tone: 'slate' }; return <div className={`emotion-result tone-${detected.tone}`} role="status"><span className="action-icon" aria-hidden="true">{detected.mark}</span><div><p className="eyebrow">A GENTLE REFLECTION</p><strong>{detected.label}</strong><p>{Math.round((emotionResult.confidence || 0) * 100)}% confidence · You decide what fits.</p></div><button className="text-button" type="button" onClick={useDetectedMood}>Use this mood</button></div>; })()}
        </section>}

        {showCreateForm && <form className="create-panel" onSubmit={handleCreateBoard}>
          <div className="create-panel-heading"><div><p className="eyebrow">START WITH A FEELING</p><h2>Make a moodboard</h2></div><button className="icon-button" type="button" onClick={() => setShowCreateForm(false)} aria-label="Close form">×</button></div>
          <label className="field-label">Give it a name<input className="design-input" maxLength={80} required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Sunday state of mind" /></label>
          <label className="field-label">A few words about it<textarea className="design-input" maxLength={500} rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What would this feeling look like?" /></label>
          <fieldset className="mood-fieldset"><legend className="field-label">Pick the closest mood</legend><div className="mood-picker">{moods.map((mood) => <button type="button" key={mood.id} aria-pressed={formData.mood === mood.id} className={`mood-choice tone-${mood.tone} ${formData.mood === mood.id ? 'selected' : ''}`} onClick={() => setFormData({ ...formData, mood: mood.id })}><span>{mood.mark}</span>{mood.label}</button>)}</div></fieldset>
          <fieldset className="board-items-editor"><legend className="field-label">Add something to your board</legend><div className="item-tool-row"><button type="button" onClick={() => addBoardItem('text')}>＋ Add a note</button><button type="button" onClick={() => addBoardItem('color')}>＋ Add a color</button><button type="button" onClick={() => addBoardItem('image')}>＋ Add an image link</button></div>{formData.items.map((item,index)=><div className="board-item-row" key={`${item.type}-${index}`}><span className={`item-type-mark item-type-${item.type}`}>{item.type==='text'?'T':item.type==='color'?'◉':'▧'}</span>{item.type==='color'?<label className="color-item-field">Color<input aria-label="Moodboard color" type="color" value={item.content||'#f5df98'} onChange={(event)=>setFormData((data)=>({...data,items:data.items.map((entry,i)=>i===index?{...entry,content:event.target.value}:entry)}))}/></label>:<input className="design-input item-content-input" type={item.type==='image'?'url':'text'} required={item.type==='image'||item.type==='text'} pattern={item.type==='image'?'https://.+':undefined} title={item.type==='image'?'Use an https image URL':undefined} placeholder={item.type==='image'?'https://… image URL':'Write a little note…'} maxLength={item.type==='image'?2048:4000} value={item.content} onChange={(event)=>setFormData((data)=>({...data,items:data.items.map((entry,i)=>i===index?{...entry,content:event.target.value}:entry)}))}/>}<button type="button" className="item-remove" aria-label="Remove item" onClick={()=>setFormData((data)=>({...data,items:data.items.filter((_,i)=>i!==index)}))}>×</button></div>)}</fieldset>
          <label className="share-toggle"><input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} /><span><strong>Share with the community</strong><small>Your board will appear in the public gallery.</small></span></label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="button-primary" type="submit" disabled={saving}>{saving ? 'Saving your board…' : 'Create moodboard'} <span>↗</span></button>
        </form>}

        <section className="boards-section">
          <div className="section-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h2>Moodboards <span className="count-pill">{boards.length}</span></h2></div><button className="text-button" onClick={openCreateForm}>＋ Create one</button></div>
          {error && <div className="inline-alert" role="alert">We couldn’t load your boards: {error}</div>}
          {loading ? <div className="loading-state"><span className="loader-dot" /> Gathering your moodboards…</div> : boards.length === 0 ? <div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span>✳</span><span>▧</span><span>◒</span></div><h3>Your collection starts here</h3><p>Start with the suggested name, save it, and add colors or notes whenever you feel like it.</p><button className="button-primary" onClick={openCreateForm}>Make your first board <span>↗</span></button></div> : <div className="boards-grid">{boards.map((board) => <BoardCard key={board._id || board.id} board={board} onDelete={handleDelete} />)}</div>}
        </section>
        {hasMore && <button className="button-primary" disabled={loading} onClick={loadMore}>{loading ? 'Loading…' : 'Load more moodboards'}</button>}
        <footer className="workspace-footer"><span>Made for all the in-between feelings.</span><span>EMOTEMODER · YOUR MOOD, YOUR MEDIUM</span></footer>
      </div>
    </div>
  );
}
