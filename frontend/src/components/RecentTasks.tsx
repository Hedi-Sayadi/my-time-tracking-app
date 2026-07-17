import type { Task } from '../api/tasks'
import { formatTime } from '../utils/datetime'
import { useAuth } from '../hooks/useAuth'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface RecentTasksProps {
  tasks: Task[]
}

function RecentTasks({ tasks }: RecentTasksProps) {
  const { user } = useAuth()

  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )

  return (
    <section className="panel" aria-label="Recent tasks">
      <div className="panel-heading">
        <h2>Recent tasks</h2>
        <span>Today</span>
      </div>

      <div className="task-list">
        {sortedTasks.length === 0 && <p>No tasks logged today yet.</p>}
        {sortedTasks.slice(0, 5).map((task) => (
          <article className="task-row" key={task.id}>
            <div>
              <strong>{task.description}</strong>
              <p>
                {task.projects.length > 0
                  ? task.projects.map((p) => p.name).join(', ')
                  : 'No project'}
                {' · '}
                {formatTime(task.startTime, user?.timezone)}
              </p>
            </div>
            <span>{formatDuration(task.durationSeconds)}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentTasks
