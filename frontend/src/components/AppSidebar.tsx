type AppSidebarItem = {
  label: string
  active?: boolean
}

const navigationItems: AppSidebarItem[] = [
  { label: 'Dashboard', active: true },
  { label: 'Projects' },
  { label: 'Tasks' },
  { label: 'Reports' },
  { label: 'Settings' },
]

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
        {navigationItems.map((item) => (
          <a
            key={item.label}
            className={item.active ? 'sidebar-link active' : 'sidebar-link'}
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Today</span>
        <strong>5h 20m tracked</strong>
      </div>
    </aside>
  )
}

export default AppSidebar