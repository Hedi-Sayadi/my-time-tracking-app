import { useAuth } from '../hooks/useAuth'

function SettingsPage() {
  const { user, logout } = useAuth()

  const settings = [
    { label: 'Workspace', value: 'Personal', note: 'Study and project tracking' },
  ]

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1>Adjust the things that make the app fit your workflow.</h1>
      </header>

      <article className="panel">
        <h2>Preferences</h2>
        <div className="task-list">
          {settings.map((setting) => (
            <article className="task-row" key={setting.label}>
              <div>
                <strong>{setting.label}</strong>
                <p>{setting.note}</p>
              </div>
              <span>{setting.value}</span>
            </article>
          ))}
        </div>
      </article>

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
