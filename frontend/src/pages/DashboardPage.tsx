import AppSidebar from '../components/AppSidebar'
import MetricCard from '../components/MetricCard'
import RecentTasks from '../components/RecentTasks'
import TimerCard from '../components/TimerCard'

const metrics = [
  { label: 'Tracked today', value: '5h 20m', note: 'Mostly lecture prep and notes' },
  { label: 'Projects', value: '8', note: 'Lectures, seminars, and a bit of side work' },
  { label: 'Running timer', value: '1', note: 'One task is still active' },
]

function DashboardPage() {
  return (
    <main className="app-shell">
      <AppSidebar />

      <section className="dashboard-content">
        <header className="topbar">
          <div>
            <h1 className="hero-title">
              <span>Keep track of your work</span>
              <span>without the clutter.</span>
            </h1>
          </div>

          <button type="button" className="secondary-button">
            Open overview
          </button>
        </header>

        <TimerCard />

        <section className="metric-grid" aria-label="Summary metrics">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
            />
          ))}
        </section>

        <RecentTasks />
      </section>
    </main>
  )
}

export default DashboardPage