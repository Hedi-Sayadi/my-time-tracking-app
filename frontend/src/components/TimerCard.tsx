import { useState, useEffect } from 'react';
import { useActiveTask, useStartTask, useStopTask, useResumeTask, useDeleteTask, useTasks } from '../api/tasks';
import { useProjects } from '../api/projects';
import { useAuth } from '../hooks/useAuth';
import type { Task } from '../api/tasks';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TimerCard() {
  const { user } = useAuth();
  const { data: activeTask, isLoading } = useActiveTask();
  const startTask = useStartTask();
  const stopTask = useStopTask();
  const resumeTask = useResumeTask();
  const deleteTask = useDeleteTask();
  const { data: projects } = useProjects();
  const { data: allTasks } = useTasks();
  const myTasks = allTasks?.filter((t) => t.userId === user?.id);

  const [description, setDescription] = useState('');
  const [projectIds, setProjectIds] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [pausedTask, setPausedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!activeTask?.running) {
      setElapsed(0);
      return;
    }
    const start = new Date(activeTask.startTime).getTime();
    const tick = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeTask]);

  const handleStart = async () => {
    await startTask.mutateAsync({
      description: description || 'Untitled task',
      projectIds: projectIds.length > 0 ? projectIds : undefined,
    });
    setDescription('');
    setProjectIds([]);
    setPausedTask(null);
  };

  const handleStop = async () => {
    if (activeTask) {
      const stopped = await stopTask.mutateAsync(activeTask.id);
      setPausedTask(stopped);
    }
  };

  const handleResume = async () => {
    if (pausedTask) {
      await resumeTask.mutateAsync(pausedTask.id);
      setPausedTask(null);
    }
  };

  const handleLogTime = () => {
    setPausedTask(null);
  };

  const handleCancel = async () => {
    if (pausedTask) {
      await deleteTask.mutateAsync(pausedTask.id);
      setPausedTask(null);
    }
  };

  const toggleProject = (id: number) => {
    setProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectRecentTask = (desc: string) => {
    if (desc === '0') {
      setDescription('');
      setProjectIds([]);
      return;
    }
    const task = recentTasks.find((t) => t.description === desc);
    if (task) {
      setDescription(task.description);
      setProjectIds(task.projects.map((p) => p.id));
    }
  };

  if (isLoading) {
    return (
      <section className="hero-card timer-card" aria-label="Active timer">
        <p>Loading...</p>
      </section>
    );
  }

  const isRunning = !!activeTask?.running;
  const isPaused = !!pausedTask && !isRunning;

  const recentTasks = myTasks
    ? [...new Map(
        [...myTasks]
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .map((t) => [t.description, t])
      ).values()].slice(0, 10)
    : [];

  return (
    <section className="hero-card timer-card" aria-label="Active timer">
      {isRunning ? (
        <div className="timer-info">
          <p className="timer-label">Recording time for</p>
          <h2 className="timer-task-name">{activeTask!.description}</h2>
          {activeTask!.projects.length > 0 && (
            <div className="timer-projects">
              {activeTask!.projects.map((p) => (
                <span key={p.id} className="project-pill">{p.name}</span>
              ))}
            </div>
          )}
        </div>
      ) : isPaused ? (
        <div className="timer-info">
          <p className="timer-label">Timer paused</p>
          <h2 className="timer-task-name">{pausedTask.description}</h2>
          {pausedTask.projects.length > 0 && (
            <div className="timer-projects">
              {pausedTask.projects.map((p) => (
                <span key={p.id} className="project-pill">{p.name}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="eyebrow">No active task</p>
          <h2>Ready to start tracking</h2>
        </div>
      )}

      <div className="timer-display">
        <span>
          {isRunning
            ? formatDuration(elapsed)
            : isPaused
              ? formatDuration(pausedTask!.durationSeconds)
              : '00:00:00'}
        </span>
        <small>
          {isRunning ? 'Timer running' : isPaused ? 'Paused' : 'Ready'}
        </small>
      </div>

      <div className="timer-actions">
        {isRunning ? (
          <button type="button" className="stop-button" onClick={handleStop} disabled={stopTask.isPending}>
            {stopTask.isPending ? 'Stopping...' : 'Stop timer'}
          </button>
        ) : isPaused ? (
          <div className="timer-pause-actions">
            <button type="button" className="primary-button" onClick={handleResume} disabled={resumeTask.isPending}>
              {resumeTask.isPending ? 'Resuming...' : 'Resume'}
            </button>
            <button type="button" className="secondary-button" onClick={handleLogTime}>
              Log time
            </button>
            <button type="button" className="danger-button" onClick={handleCancel} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
        ) : (
          <>
            {recentTasks.length > 0 && (
              <div className="timer-recent-tasks">
                <label className="timer-recent-label">
                  Or continue a recent task
                  <select
                    className="timer-recent-select"
                    onChange={(e) => selectRecentTask(e.target.value)}
                    value={description || '0'}
                  >
                    <option value="0">— New task —</option>
                    {recentTasks.map((task) => (
                      <option key={task.id} value={task.description}>
                        {task.description}
                        {task.projects.length > 0 ? ` (${task.projects.map((p) => p.name).join(', ')})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <input
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="timer-input"
            />

            {projects && projects.length > 0 && (
              <div className="timer-project-select">
                <span className="timer-project-label">Projects:</span>
                <div className="timer-project-checkboxes">
                  {projects.map((project) => (
                    <label key={project.id} className="project-checkbox-inline">
                      <input
                        type="checkbox"
                        checked={projectIds.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                      />
                      {project.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="timer-main-actions">
              <button type="button" className="primary-button" onClick={handleStart} disabled={startTask.isPending}>
                {startTask.isPending ? 'Starting...' : 'Start timer'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.href = '/tasks'}
                title="Manually log a past or offline time entry"
              >
                Add entry
              </button>
            </div>
            <p className="timer-helper-text">
              Start the timer for live tracking, or use Add entry to log past time manually.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default TimerCard;
