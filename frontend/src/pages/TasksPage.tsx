import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks, useDeleteTask, type Task } from '../api/tasks';
import TaskForm from '../components/TaskForm';
import { formatTime } from '../utils/datetime';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TasksPage() {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Tasks</p>
        <h1>Review, edit, and organize the time you already tracked.</h1>
      </header>

      <div className="page-actions">
        <button type="button" className="primary-button" onClick={() => { setEditingTask(null); setShowForm(true); }}>
          Add manual entry
        </button>
      </div>

      {showForm && (
        <article className="panel">
          <h2>{editingTask ? 'Edit task' : 'New task'}</h2>
          <TaskForm
            initialData={editingTask ?? undefined}
            onSuccess={() => { setShowForm(false); setEditingTask(null); }}
            onCancel={() => { setShowForm(false); setEditingTask(null); }}
          />
        </article>
      )}

      <article className="panel">
        <h2>Task list</h2>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="task-list">
            {tasks?.length === 0 && <p>No tasks yet.</p>}
            {tasks?.map((task) => (
              <article className="task-row" key={task.id}>
                <div>
                  <strong>{task.description}</strong>
                  <p>
                    {formatTime(task.startTime, user?.timezone)}
                    {task.endTime && ` → ${formatTime(task.endTime, user?.timezone)}`}
                    {' '}
                    ({formatDuration(task.durationSeconds)})
                  </p>
                  {task.projects.length > 0 && (
                    <p className="project-tags">
                      {task.projects.map((p) => p.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="secondary-button small"
                    onClick={() => { setEditingTask(task); setShowForm(true); }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button small"
                    onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate(task.id); }}
                    disabled={deleteTask.isPending}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default TasksPage;
