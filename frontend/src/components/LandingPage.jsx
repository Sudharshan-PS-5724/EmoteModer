import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import ThemeToggle from './ThemeToggle';

const moods = [
  { label: 'Feeling lighter', name: 'happy', tone: 'sun' },
  { label: 'Need a pause', name: 'soft', tone: 'blue' },
  { label: 'Fired up', name: 'bold', tone: 'coral' },
  { label: 'Not sure yet', name: 'uncertain', tone: 'slate' },
  { label: 'Ready to move on', name: 'release', tone: 'green' },
  { label: 'Caught off guard', name: 'surprise', tone: 'pink' },
];

const moodPaths = {
  happy: <><path d="m12 2 2.1 6.1L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-1.9L12 2Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  soft: <><path d="M4 14c2.2-5.3 4.7-5.3 7 0s4.8 5.3 7 0" /><path d="M5 7c1.8-2 4.1-3 7-3s5.2 1 7 3" /></>,
  bold: <path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" />,
  uncertain: <><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 7a5 5 0 1 0 5 5" /><path d="M12 11a1 1 0 1 0 1 1" /></>,
  release: <><path d="M4 17 18 7" /><path d="M11 7h7v7" /><path d="M4 21h16" /></>,
  surprise: <><path d="m12 2 2.1 6.1L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-1.9L12 2Z" /><path d="M19 3v4m-2-2h4" /></>,
  talk: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-6.5a2.5 2.5 0 0 1-1-2V5.5Z" /><path d="M8 8h8M8 12h5" /></>,
  collect: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-2.2 1.3L12 17l-5.8 2.8A1.5 1.5 0 0 1 4 18.5v-13Z" /><path d="M8 8h8M8 11h5" /></>,
  discover: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5m-10-14v7m-3.5-3.5h7" /></>,
};

function MoodMark({ name, className = 'mood-symbol' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {moodPaths[name]}
    </svg>
  );
}
const features = [
  {
    number: '01',
    title: 'Talk it out',
    description: 'Find a room that fits today. Listen, share, and change moods when you need to.',
    icon: 'talk',
    link: '/chat',
    action: 'Find your room',
    tone: 'feature-pink',
  },
  {
    number: '02',
    title: 'Make it yours',
    description: 'Turn words, colors, and saved moments into a board that feels like you.',
    icon: 'collect',
    link: '/login',
    action: 'Start collecting',
    tone: 'feature-gold',
  },
  {
    number: '03',
    title: 'Find a new view',
    description: 'Wander through the community gallery and see the world through someone else’s mood.',
    icon: 'discover',
    link: '/gallery',
    action: 'Explore the gallery',
    tone: 'feature-plum',
  },
];

export default function LandingPage() {
  const { login, authError } = useAuth();

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="brand-lockup" aria-label="EmoteModer home">
          <span className="brand-mark">e<span>m</span></span>
          <span className="brand-name">emote<span>moder</span><small>feel it. make it.</small></span>
        </Link>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to="/gallery" className="landing-gallery-link">Explore the gallery <span>↗</span></Link>
          <Link to="/demo" className="landing-gallery-link">Try a demo <span>↗</span></Link>
          <Link to="/login" className="landing-signin-link">Sign in <span>↗</span></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">A SOCIAL SPACE FOR EVERY SIDE OF YOU</p>
          <h1>Feel it.<br /><span>Make something</span><br />of it.</h1>
          <p className="hero-description">A place to talk it out, save the little things, and find people who get the mood you’re in.</p>
          <div className="hero-actions">
            <button className="button-primary hero-cta" onClick={login}>Make your space <span>↗</span></button>
            <Link className="hero-secondary" to="/demo">Try out a demo emo <span>→</span></Link>
            <Link className="hero-secondary" to="/gallery">See what people are making <span>→</span></Link>
          </div>
          {authError && <p className="form-error hero-auth-error" role="alert">{authError}</p>}
          <div className="hero-social-proof">
            <div className="proof-avatars" aria-hidden="true">
              {moods.slice(0, 3).map((mood) => (
                <span key={mood.name} className={'proof-avatar tone-' + mood.tone}>
                  <MoodMark name={mood.name} />
                </span>
              ))}
              <span className="proof-plus" aria-hidden="true">+</span>
            </div>
            <p>A softer place to show up<br /><strong>exactly as you are.</strong></p>
          </div>
        </div>

        <div className="hero-art" aria-label="A playful arrangement of colorful moodboard cards">
          <div className="hero-card hero-card-back">
            <small>COLLECT A MOMENT</small>
            <MoodMark name="happy" className="hero-card-mark" />
          </div>
          <div className="hero-card hero-card-main">
            <MoodMark name="soft" className="hero-main-glyph" />
            <p>somewhere<br />between okay<br />and figuring it out</p>
            <small>YOUR FEELING, YOURS TO KEEP</small>
          </div>
          <div className="hero-card hero-card-sticker">
            little<br />by little
            <MoodMark name="release" className="sticker-mark" />
          </div>
          <div className="hero-note">a mood can be<br />more than one thing</div>
          <div className="hero-art-caption"><span>COLLECTION Nº 01</span><span>MADE OF FEELINGS</span></div>
        </div>
      </section>

      <section className="promise-ribbon" aria-label="EmoteModer: say, save, share, revisit">
        <p>YOUR FEELING, YOUR MEDIUM</p>
        <div className="promise-items">
          <span><b>01</b> say it</span>
          <i aria-hidden="true" />
          <span><b>02</b> save it</span>
          <i aria-hidden="true" />
          <span><b>03</b> share it</span>
          <i aria-hidden="true" />
          <span><b>04</b> come back to it</span>
        </div>
        <span className="promise-sticker">no wrong order ↗</span>
      </section>

      <section className="landing-moods">
        <div className="landing-section-title">
          <p className="eyebrow">THERE’S NO WRONG WAY TO FEEL</p>
          <h2>Make room for all of it.</h2>
          <p>Pick a starting point. Your mood is allowed to change.</p>
        </div>
        <div className="mood-preview-grid">
          {moods.map((mood) => (
            <div key={mood.name} className={'mood-preview tone-' + mood.tone}>
              <MoodMark name={mood.name} />
              <strong>{mood.label}</strong>
              <span className="mood-spark" aria-hidden="true">↗</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <div className="how-heading">
          <p className="eyebrow">A LITTLE BIT OF EVERYTHING YOU NEED</p>
          <h2>Talk, collect,<br />come back to yourself.</h2>
          <p>Keep it small, make it yours, and let the mood move.</p>
          <span className="how-stamp">MADE FOR<br />THE IN-BETWEEN</span>
        </div>
        <div className="how-cards">
          {features.map((feature) => (
            <article className={'feature-card ' + feature.tone} key={feature.number}>
              <div className="feature-card-top">
                <span className="feature-number">{feature.number}</span>
                <MoodMark name={feature.icon} className="feature-icon" />
              </div>
              <div>
                <strong>{feature.title}</strong>
                <p>{feature.description}</p>
              </div>
              <Link to={feature.link} onClick={feature.link === '/login' ? (event) => { event.preventDefault(); login(); } : undefined}>
                {feature.action}<span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>emote moder · for every in-between</span>
        <button onClick={login}>Come on in ↗</button>
      </footer>
    </main>
  );
}
