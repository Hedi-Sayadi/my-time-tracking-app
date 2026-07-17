import { useAuth } from '../hooks/useAuth'

function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1>Account and session management.</h1>
      </header>

      <article className="panel">
        <h2>Account</h2>
        <div className="task-list">
          <article className="task-row">
            <div>
              <strong>Signed in as</strong>
              <p>{user?.username ?? 'Unknown user'}</p>
            </div>
          </article>
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button type="button" className="danger-button" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </article>
    </section>
  )
}

export default SettingsPage
