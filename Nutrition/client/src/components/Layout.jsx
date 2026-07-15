import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', icon: 'bi-grid-1x2-fill', label: 'Overview', roles: ['user', 'dietitian', 'admin'] },
  { to: '/clients', icon: 'bi-people-fill', label: 'Clients', roles: ['dietitian', 'admin'] },
  { to: '/meal-plans', icon: 'bi-journal-medical', label: 'Meal Plans', roles: ['user', 'dietitian', 'admin'] },
  { to: '/progress', icon: 'bi-graph-up-arrow', label: 'Progress', roles: ['user', 'dietitian', 'admin'] },
  { to: '/admin', icon: 'bi-shield-check', label: 'Administration', roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><i className="bi bi-flower1" /></div>
          <div><strong>Nutrition</strong><span>Assistant</span></div>
        </div>
        <nav className="side-nav">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              <i className={`bi ${item.icon}`} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div><strong>{user.name}</strong><span>{user.role}</span></div>
          </div>
          <button className="logout-button" onClick={logout}><i className="bi bi-box-arrow-right" /> Sign out</button>
        </div>
      </aside>
      <header className="mobile-header">
        <div className="brand compact"><div className="brand-mark"><i className="bi bi-flower1" /></div><strong>Nutrition Assistant</strong></div>
        <button className="btn btn-sm btn-outline-secondary" onClick={logout}><i className="bi bi-box-arrow-right" /></button>
      </header>
      <main className="main-content"><Outlet /></main>
      <nav className="mobile-nav">
        {visibleItems.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            <i className={`bi ${item.icon}`} /><span>{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
