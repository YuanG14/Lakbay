import { Bell, CarFront, ChartNoAxesCombined, Compass, LayoutDashboard, Menu, Route, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plan-trip', label: 'Plan Trip', icon: Compass },
  { to: '/trips', label: 'My Trips', icon: Route },
  { to: '/garage', label: 'My Garage', icon: CarFront },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="nav-list">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon size={19} strokeWidth={2.1} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="app-shell">
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
      <aside className={`sidebar mobile-drawer${open ? ' open' : ''}`}>
        <div className="drawer-top">
          <Brand />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        {links}
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="topbar-spacer" />
          <button className="icon-btn notification-btn" aria-label="Notifications">
            <Bell size={19} />
            <span className="notification-dot" />
          </button>
          <div className="profile-chip">
            <div className="avatar">JC</div>
            <div className="profile-copy">
              <strong>Joshua</strong>
              <span>Traveler</span>
            </div>
          </div>
        </header>
        <main className="page-wrap"><Outlet /></main>
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
