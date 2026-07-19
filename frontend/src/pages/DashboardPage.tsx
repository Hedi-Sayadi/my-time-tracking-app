import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import RecentTasks from '../components/RecentTasks';
import TimerCard from '../components/TimerCard';
import CircularProgress from '../components/CircularProgress';
import { useTaskOverview } from '../api/tasks';
import { useProjects } from '../api/projects';
import { useActiveTask } from '../api/tasks';
import { useWeeklyGoal } from '../api/auth';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { data: overview } = useTaskOverview('today');
  const { data: projects } = useProjects();
  const { data: activeTask } = useActiveTask();
  const { data: goal } = useWeeklyGoal();

  const metrics = useMemo(() => {
    const totalSeconds = overview?.totalDurationSeconds ?? 0;
    const taskCount = overview?.tasks?.length ?? 0;
    const projectCount = projects?.length ?? 0;
    const hasActiveTask = !!activeTask?.running;

    return [
      {
        label: 'Tracked today',
        value: totalSeconds > 0 ? formatDuration(totalSeconds) : '0h 0m',
        note:
          taskCount > 0
            ? `${taskCount} task${taskCount === 1 ? '' : 's'} logged today`
            : 'No tasks logged yet today',
      },
      {
        label: 'Projects',
        value: String(projectCount),
        note: projectCount > 0 ? 'Accessible projects' : 'No projects yet',
      },
      {
        label: 'Running timer',
        value: hasActiveTask ? '1' : '0',
        note: hasActiveTask
          ? `${activeTask?.description ?? 'One task'} is active`
          : 'No active task',
      },
    ];
  }, [overview, projects, activeTask]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="hero-title">
            <span>Keep track of your work</span>
            <span>without the clutter.</span>
          </h1>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate('/reports')}
        >
          Open overview
        </button>
      </header>

      <TimerCard />

      <section className="metric-grid" aria-label="Summary metrics">
        {metrics.map(metric => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
          />
        ))}
      </section>

      {goal && goal.targetHours > 0 && (
        <section className="panel">
          <h2>Your weekly goal</h2>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
            <CircularProgress
              value={goal.progressPercent}
              label={`${formatDuration(goal.spentSeconds)} / ${goal.targetHours}h`}
              sublabel={`Week ${goal.weekStart} – ${goal.weekEnd}`}
              size={160}
            />
          </div>
        </section>
      )}

      <RecentTasks tasks={overview?.tasks ?? []} />
    </>
  );
}

export default DashboardPage;
