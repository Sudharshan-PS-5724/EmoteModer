import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import BoardPieces from './BoardPieces';

const moods = [
  { id: 'happy', label: 'Feeling lighter', mark: '✳', tone: 'sun' },
  { id: 'sad', label: 'Need a pause', mark: '◒', tone: 'blue' },
  { id: 'angry', label: 'Fired up', mark: 'ϟ', tone: 'coral' },
  { id: 'fear', label: 'Not sure yet', mark: '⌁', tone: 'slate' },
  { id: 'surprise', label: 'Caught off guard', mark: '✦', tone: 'pink' },
];

const demoBoards = [
  { id: 'sunday', title: 'Sunday, slowly', description: 'Warm light, no plans, a cup of tea.', mood: 'happy', pieces: [{ type: 'color', content: '#e8b343' }, { type: 'text', content: 'leave space for nothing' }, { type: 'color', content: '#faa4c4' }] },
  { id: 'inbetween', title: 'The in-between', description: 'Not lost. Just gathering myself.', mood: 'fear', pieces: [{ type: 'text', content: 'one small next step' }, { type: 'color', content: '#5a8cd1' }, { type: 'text', content: 'breathe first' }] },
  { id: 'plot', title: 'Plot twist energy', description: 'A new idea arrived before I was ready.', mood: 'surprise', pieces: [{ type: 'color', content: '#eb6837' }, { type: 'text', content: 'maybe this changes everything' }, { type: 'color', content: '#79333e' }] },
];

const roomData = {
  soft: { label: 'Slow corner', mark: '◒', people: 14, messages: [{ name: 'VK', text: 'Today felt a little heavy, so I made tea and stopped rushing.', time: '10:18' }, { name: 'ABD', text: 'That sounds like enough for today. Thanks for saying it.', time: '10:20' }, { name: 'Sanga', text: 'Putting “slow morning” on my board now.', time: '10:21' }] },
  bright: { label: 'Good news', mark: '✳', people: 28, messages: [{ name: 'Glenn', text: 'I finally shared the thing I was nervous about!', time: '09:42' }, { name: 'Roddy', text: 'That deserves a tiny celebration.', time: '09:43' }, { name: 'MSD', text: 'Save that feeling somewhere. It is a good one.', time: '09:45' }] },
  plot: { label: 'Surprise lane', mark: '✦', people: 19, messages: [{ name: 'D', text: 'A surprise opportunity showed up this morning.', time: '11:03' }, { name: 'VJ', text: 'That can take a minute to sink in. I am listening.', time: '11:05' }] },
};

export default function DemoExperience() {
  const [tab, setTab] = useState('guide');
  const [currentMood, setCurrentMood] = useState('happy');
  const [selectedRoom, setSelectedRoom] = useState('soft');
  const [messages, setMessages] = useState(() => Object.fromEntries(Object.entries(roomData).map(([id, room]) => [id, room.messages])));
  const [draft, setDraft] = useState('');
  const [completed, setCompleted] = useState(new Set());
  const room = roomData[selectedRoom];
  const selectedMood = moods.find((mood) => mood.id === currentMood) || moods[0];
  const progress = completed.size;
  const boardCount = useMemo(() => demoBoards.length, []);

  const complete = (step) => setCompleted((previous) => new Set([...previous, step]));
  const sendDemoMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((previous) => ({ ...previous, [selectedRoom]: [...previous[selectedRoom], { name: 'Demo you', text, time: 'now', mine: true }] }));
    setDraft(''); complete('room');
  };

  return <main className="demo-page">
    <header className="demo-header">
      <Link to="/" className="brand-lockup" aria-label="Leave demo and return home"><span className="brand-mark">e<span>m</span></span><span className="brand-name">emote<span>moder</span><small>feel it. make it.</small></span></Link>
      <div className="demo-header-actions"><span className="demo-pill">DEMO MODE · NOTHING IS SAVED</span><ThemeToggle /><Link className="landing-signin-link" to="/login">Sign in for real <span>↗</span></Link></div>
    </header>

    <div className="demo-shell">
      <section className="demo-intro">
        <div><p className="eyebrow">WELCOME TO THE WALKTHROUGH</p><h1>See how a day<br /><span>can take shape.</span></h1><p>Have a look around. This is a sample space, and anything you type stays in this browser.</p></div>
        <div className="demo-progress"><span>{progress}/3</span><strong>things you have tried</strong><div><i style={{ width: `${(progress / 3) * 100}%` }} /></div></div>
      </section>

      <nav className="demo-tabs" aria-label="Demo sections">
        {[['guide', '01', 'Take the tour'], ['boards', '02', 'Moodboards'], ['rooms', '03', 'Mood rooms']].map(([id, number, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><span>{number}</span>{label}</button>)}
      </nav>

      {tab === 'guide' && <section className="demo-guide">
        <article className="demo-guide-card tone-sun"><span className="guide-number">01</span><div className="guide-glyph">✳</div><h2>Name the feeling.</h2><p>There is no right answer. Pick what feels closest for this moment.</p><div className="demo-mood-picker">{moods.map((mood) => <button key={mood.id} className={`tone-${mood.tone} ${currentMood === mood.id ? 'selected' : ''}`} onClick={() => { setCurrentMood(mood.id); complete('mood'); }} aria-pressed={currentMood === mood.id}><b>{mood.mark}</b>{mood.label}</button>)}</div><small>Right now: <b>{selectedMood.label}</b></small></article>
        <article className="demo-guide-card tone-pink"><span className="guide-number">02</span><div className="guide-glyph">▧</div><h2>Collect the proof.</h2><p>Moodboards hold colors, notes, and moments without asking you to explain everything.</p><button className="button-primary" onClick={() => { setTab('boards'); complete('board'); }}>Open a demo board <span>↗</span></button></article>
        <article className="demo-guide-card tone-green"><span className="guide-number">03</span><div className="guide-glyph">⌁</div><h2>Find the room.</h2><p>Listen in, add a thought, or just be around people in a similar headspace.</p><button className="button-primary" onClick={() => setTab('rooms')}>Visit mood rooms <span>↗</span></button></article>
      </section>}

      {tab === 'boards' && <section className="demo-content"><div className="demo-content-heading"><div><p className="eyebrow">SAMPLE COLLECTION</p><h2>{boardCount} ways a day can feel.</h2><p>Each one starts with a few small things that mattered.</p></div><button className="text-button" onClick={() => setTab('guide')}>← Back to tour</button></div><div className="demo-board-grid">{demoBoards.map((board) => { const mood = moods.find((entry) => entry.id === board.mood) || moods[0]; return <article className="demo-board-card" key={board.id}><div className={`demo-board-art tone-${mood.tone}`}><BoardPieces items={board.pieces} /><span>{mood.mark}</span></div><div><p className="eyebrow">{mood.label.toUpperCase()} · SAMPLE BOARD</p><h3>{board.title}</h3><p>{board.description}</p></div></article>; })}</div><aside className="demo-tip"><span>✦</span><p><b>Try this in your own space:</b> add one color, one sentence, and one small thing you noticed today.</p><Link to="/login">Make a real moodboard ↗</Link></aside></section>}

      {tab === 'rooms' && <section className="demo-content"><div className="demo-content-heading"><div><p className="eyebrow">COMMUNITY SAMPLE</p><h2>Drop into a mood room.</h2><p>These sample conversations are here to help you get the feel of the space. Your demo messages stay in this tab only.</p></div><button className="text-button" onClick={() => setTab('guide')}>← Back to tour</button></div><div className="demo-rooms-layout"><aside className="demo-room-list">{Object.entries(roomData).map(([id, item]) => <button key={id} className={selectedRoom === id ? 'selected' : ''} onClick={() => setSelectedRoom(id)}><span>{item.mark}</span><div><b>{item.label}</b><small>{item.people} here now</small></div></button>)}</aside><section className="demo-chat"><header><div><span>{room.mark}</span><div><h3>{room.label}</h3><p>{room.people} people here · be kind</p></div></div><span className="demo-live">DEMO</span></header><div className="demo-message-list">{messages[selectedRoom].map((message, index) => <article className={message.mine ? 'mine' : ''} key={`${message.name}-${index}`}><b>{message.name}</b><p>{message.text}</p><small>{message.time}</small></article>)}</div><form onSubmit={sendDemoMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} placeholder="Write something kind…" /><button type="submit">Send ↗</button></form></section></div></section>}
    </div>
  </main>;
}
