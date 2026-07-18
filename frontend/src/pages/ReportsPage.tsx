import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTaskOverview, type Task } from '../api/tasks';
import { formatTime } from '../utils/datetime';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const { data: overview, isLoading } = useTaskOverview(period);

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Reports</p>
        <h1>See where the time went across the day, week, or month.</h1>
      </header>

      <div className="page-actions">
        {(['today', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            type="button"
            className={period === p ? 'primary-button' : 'secondary-button'}
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This week' : 'This month'}
          </button>
        ))}
      </div>

      <article className="panel">
        <h2>
          {period === 'today'
            ? "Today's summary"
            : period === 'week'
              ? 'Weekly summary'
              : 'Monthly summary'}
        </h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="metric-grid">
              <article className="metric-card">
                <span>Total time</span>
                <strong>{formatDuration(overview?.totalDurationSeconds ?? 0)}</strong>
                <p>Across {overview?.tasks?.length ?? 0} tasks</p>
              </article>
            </div>

            <div className="task-list" style={{ marginTop: 20 }}>
              {overview?.tasks && overview.tasks.length > 0 ? (
                overview.tasks.map((task: Task) => (
                  <article className="task-row" key={task.id}>
                    <div>
                      <strong>{task.description}</strong>
                      <p>
                        {formatTime(task.startTime, user?.timezone)}
                        {task.endTime && ` → ${formatTime(task.endTime, user?.timezone)}`} (
                        {formatDuration(task.durationSeconds)})
                      </p>
                      {task.projects.length > 0 && (
                        <p className="project-tags">{task.projects.map(p => p.name).join(', ')}</p>
                      )}
                    </div>
                    <span>{task.running ? 'Running' : 'Completed'}</span>
                  </article>
                ))
              ) : (
                <p>No tasks for this period.</p>
              )}
            </div>
          </>
        )}
      </article>
    </section>
  );
}

export default ReportsPage;
