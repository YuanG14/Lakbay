import { CarFront, ChartNoAxesCombined, Compass, LayoutDashboard, LogOut, Menu, Route, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NetworkStatus from '../ui/NetworkStatus';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plan-trip', label: 'Plan Trip', icon: Compass },
  { to: '/trips', label: 'My Trips', icon: Route },
  { to: '/garage', label: 'My Garage', icon: CarFront },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fullName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Traveler';
  const firstName = fullName.split(/\s+/)[0] || 'Traveler';
  const initials = firstName.slice(0, 1).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = (
    <nav className="nav-list" aria-label="Primary navigation">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon size={19} strokeWidth={2.1} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar desktop-sidebar">
        <Brand />
        {links}
        <div className="sidebar-card">
          <div className="sidebar-card-icon">₱</div>
          <strong>Plan smarter trips</strong>
          <p>Estimate travel costs before you hit the road.</p>
        </div>
      </aside>

      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar mobile-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-top">
          <Brand />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        {links}
      </aside>

      <div className="main-area">
        <NetworkStatus />
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="topbar-spacer" />
          <div className="profile-chip" title={`Signed in as ${firstName}`}>
            <div className="avatar" aria-hidden="true">{initials}</div>
            <div className="profile-copy">
              <strong>{firstName}</strong>
            </div>
          </div>
          <button className="icon-btn" disabled={signingOut} onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>
        </header>
        <main className="page-wrap" id="main-content" tabIndex={-1}><Outlet /></main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><Route size={22} /></div>
      <div>
        <div className="brand-name">Lakbay</div>
        <div className="brand-sub">Smart Trip Planner</div>
      </div>
    </div>
  );
}
