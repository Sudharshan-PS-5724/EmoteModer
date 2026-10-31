import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import ThemeToggle from './ThemeToggle';
export default function Navigation() {
  const { user, logout } = useAuth();
  const links = [
    { to: '/dashboard', label: 'My space', mark: '⌂' },
    { to: '/chat', label: 'Mood rooms', mark: '⌁' },
    { to: '/gallery', label: 'Discover', mark: '▧' },
  ];
  const name = user?.displayName?.trim()?.split(/\s+/)[0] || 'Your profile';
  const profileLink = <Link to="/profile" className="profile-link" aria-label="Open your profile">
    <span className="avatar" aria-hidden="true">{user?.displayName?.trim()?.[0]?.toUpperCase() || 'E'}</span>
    <span className="profile-name">{name}</span>
  </Link>;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/dashboard" className="brand-lockup" aria-label="EmoteModer home">
          <span className="brand-mark">e<span>m</span></span>
          <span className="brand-name">emote<span>moder</span><small>feel it. make it.</small></span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          {links.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-mark">{item.mark}</span>{item.label}
          </NavLink>)}
        </nav>
        <div className="header-profile">
          <ThemeToggle />
          {profileLink}
          <button className="logout-button" onClick={logout}>Sign out</button>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((item) => <NavLink key={item.to} to={item.to} aria-label={item.label} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <span>{item.mark}</span><small>{item.label}</small>
          </NavLink>)}
          <NavLink to="/profile" aria-label="Profile" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <span>{user?.displayName?.trim()?.[0]?.toUpperCase() || 'E'}</span><small>Profile</small>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
