import { useState, useEffect } from 'react';
import { useActiveTask, useStartTask, useStopTask } from '../api/tasks';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TimerCard() {
  const { data: activeTask, isLoading } = useActiveTask();
  const startTask = useStartTask();
  const stopTask = useStopTask();
  const [description, setDescription] = useState('');
  const [elapsed, setElapsed] = useState(0);

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
    await startTask.mutateAsync({ description: description || 'Untitled task' });
    setDescription('');
  };

  const handleStop = async () => {
    if (activeTask) {
      await stopTask.mutateAsync(activeTask.id);
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

  return (
    <section className="hero-card timer-card" aria-label="Active timer">
      <div>
        <p className="eyebrow">{isRunning ? 'Active task' : 'No active task'}</p>
        <h2>{isRunning ? activeTask!.description : 'Ready to start tracking'}</h2>
      </div>

      <div className="timer-display">
        <span>{isRunning ? formatDuration(elapsed) : '00:00:00'}</span>
        <small>{isRunning ? 'Running now' : 'Timer stopped'}</small>
      </div>

      <div className="timer-actions">
        {isRunning ? (
          <button type="button" className="primary-button" onClick={handleStop} disabled={stopTask.isPending}>
            {stopTask.isPending ? 'Stopping...' : 'Stop timer'}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="timer-input"
            />
            <button type="button" className="primary-button" onClick={handleStart} disabled={startTask.isPending}>
              {startTask.isPending ? 'Starting...' : 'Start timer'}
            </button>
          </>
        )}
        {!isRunning && (
          <button type="button" className="secondary-button" onClick={() => window.location.href = '/tasks'}>
            Add entry
          </button>
        )}
      </div>
    </section>
  );
}

export default TimerCard;
