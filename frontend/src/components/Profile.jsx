import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMood } from '../context/MoodContext.jsx';

const moodOptions = [
  { id: 'happy', label: 'Bright', tone: 'sun', mark: '✳' },
  { id: 'sad', label: 'Soft', tone: 'blue', mark: '〰' },
  { id: 'angry', label: 'Bold', tone: 'coral', mark: 'ϟ' },
  { id: 'fear', label: 'Uncertain', tone: 'slate', mark: '◎' },
  { id: 'disgust', label: 'Over it', tone: 'green', mark: '↗' },
  { id: 'surprise', label: 'A plot twist', tone: 'pink', mark: '✦' },
];

export default function Profile() {
  const { user } = useAuth();
  const { currentMood, setCurrentMood } = useMood();
  const displayName = user?.displayName?.trim() || 'EmoteModer member';
  const photo = user?.photoURL || user?.photo;

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <div className="profile-page-heading">
          <div><p className="eyebrow">YOUR CORNER, YOUR RULES</p><h1>Your profile<span>.</span></h1></div>
          <Link className="profile-back-link" to="/dashboard">Back to my space ↗</Link>
        </div>
        <section className="profile-identity">
          {photo ? <img className="profile-photo" src={photo} alt="" referrerPolicy="no-referrer" /> : <span className="profile-photo profile-initial" aria-hidden="true">{displayName[0]?.toUpperCase() || 'E'}</span>}
          <div><p className="eyebrow">SHOWING UP AS</p><h2>{displayName}</h2><p>{user?.email || 'Your personal EmoteModer space'}</p></div>
        </section>
        <section className="profile-mood-section">
          <p className="eyebrow">TODAY’S MOOD</p>
          <h2>What feels closest?</h2>
          <div className="profile-moods">
            {moodOptions.map((mood) => <button type="button" key={mood.id} aria-pressed={currentMood === mood.id} className={`profile-mood tone-${mood.tone} ${currentMood === mood.id ? 'selected' : ''}`} onClick={() => setCurrentMood(mood.id)}>
              <span aria-hidden="true">{mood.mark}</span>{mood.label}
            </button>)}
          </div>
        </section>
      </div>
    </main>
  );
}
