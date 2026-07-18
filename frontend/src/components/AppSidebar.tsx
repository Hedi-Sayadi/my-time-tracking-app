import { NavLink } from 'react-router-dom';

type AppSidebarItem = {
  label: string;
  to: string;
  end?: boolean;
};

const navigationItems: AppSidebarItem[] = [
  { label: 'Dashboard', to: '/', end: true },
  { label: 'Projects', to: '/projects' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
];

function AppSidebar() {
  return (
    <aside className="sidebar-panel" aria-label="Navigation">
      <div className="sidebar-brand">
        <span className="brand-mark">TT</span>
        <div>
          <strong>TimeTrack</strong>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AppSidebar;
