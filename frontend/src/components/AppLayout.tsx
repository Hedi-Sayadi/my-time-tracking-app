import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppSidebar from './AppSidebar'

function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <AppSidebar />

      <div className="dashboard-wrapper">
        <header className="content-header">
          <div className="header-spacer" />
          {user && (
            <div className="header-user">
              <span className="header-username">{user.username}</span>
              <button type="button" className="header-logout" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
