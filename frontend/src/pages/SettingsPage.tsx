import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpdateTimezone } from '../api/auth';

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Europe/Rome',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

function SettingsPage() {
  const { user, logout } = useAuth();
  const updateTimezone = useUpdateTimezone();

  const [selectedTz, setSelectedTz] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [tzMessage, setTzMessage] = useState('');

  const handleTimezoneChange = async (tz: string) => {
    setSelectedTz(tz);
    setTzMessage('');
    try {
      await updateTimezone.mutateAsync({ timezone: tz });
      setTzMessage('Timezone saved');
    } catch {
      setTzMessage('Failed to save timezone');
    }
  };

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

      <article className="panel">
        <h2>Time zone</h2>
        <p className="timer-helper-text" style={{ marginBottom: 12 }}>
          All timestamps will be displayed in your preferred time zone.
        </p>
        <label className="timer-recent-label">
          Preferred time zone
          <select
            className="timer-recent-select"
            value={selectedTz}
            onChange={(e) => handleTimezoneChange(e.target.value)}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
        {tzMessage && (
          <p style={{ marginTop: 8, color: tzMessage.includes('saved') ? '#16a34a' : '#dc2626', fontSize: '0.85rem' }}>
            {tzMessage}
          </p>
        )}
      </article>
    </section>
  )
}

export default SettingsPage
