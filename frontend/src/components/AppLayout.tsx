import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'

function AppLayout() {
  return (
    <div className="app-shell">
      <AppSidebar />

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout