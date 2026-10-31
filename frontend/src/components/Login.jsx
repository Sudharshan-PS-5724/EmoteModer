import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import ThemeToggle from './ThemeToggle';
export default function Login() {
  const { login, authError, loading } = useAuth();
  const [startingSignIn, setStartingSignIn] = useState(false);

  const handleSignIn = async () => {
    setStartingSignIn(true);
    try {
      await login();
    } finally {
      setStartingSignIn(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-topline">
        <Link to="/" className="brand-lockup login-brand" aria-label="EmoteModer home">
          <span className="brand-mark">e<span>m</span></span>
          <span className="brand-name">emote<span>moder</span><small>feel it. make it.</small></span>
        </Link>
        <ThemeToggle />
      </div>
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-art" aria-hidden="true">
          <span className="login-shape shape-a">✳</span>
          <span className="login-shape shape-b">◒</span>
          <span className="login-shape shape-c">⌁</span>
          <span className="login-sticker">YOU<br />BELONG<br />HERE</span>
        </div>
        <p className="eyebrow">YOUR SPACE IS WAITING</p>
        <h1 id="login-title">Come as<br /><span>you are.</span></h1>
        <p className="login-copy">Save the moments, colors, and feelings that make up your day.</p>
        <div className="login-actions">
          <button type="button" className="google-button" onClick={handleSignIn} disabled={startingSignIn || loading}>
            <svg aria-hidden="true" viewBox="0 0 48 48" width="19" height="19">
              <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z" />
              <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
              <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 17.9l6.8-5.2Z" />
              <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
            </svg>
            {startingSignIn ? 'Connecting…' : 'Continue with Google'} <span aria-hidden="true">↗</span>
          </button>
          <span className="login-action-divider">or explore first</span>
          <Link className="login-demo-button" to="/demo"><span aria-hidden="true">✦</span> Try the interactive demo <b>↗</b></Link>
        </div>
        {authError && <p className="form-error" role="alert">{authError}</p>}
        <p className="login-terms">Google sign-in keeps your personal space connected to you.</p>
        <Link className="login-back" to="/">← Back to home</Link>
      </section>
    </main>
  );
}
