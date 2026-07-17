import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProject, useProjectMembers, useShareProject, useUnshareProject } from '../api/projects';
import { useProjectTime, useProjectTasks } from '../api/tasks';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function toISOLocal(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const { user } = useAuth();

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState(toISOLocal(weekAgo));
  const [to, setTo] = useState(toISOLocal(today));

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: timeData, isLoading: timeLoading } = useProjectTime(
    projectId,
    new Date(from).toISOString(),
    new Date(to).toISOString()
  );
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(
    projectId,
    new Date(from).toISOString(),
    new Date(to).toISOString()
  );

  const shareProject = useShareProject();
  const unshareProject = useUnshareProject();

  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');

  const isLoading = projectLoading || timeLoading || tasksLoading || membersLoading;
  const isOwner = project?.ownerId === user?.id;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');
    if (!shareUsername.trim()) return;
    try {
      await shareProject.mutateAsync({ id: projectId, username: shareUsername.trim() });
      setShareUsername('');
    } catch (err: any) {
      setShareError(err.response?.data?.detail || 'Failed to share project');
    }
  };

  const handleUnshare = async (memberUserId: number) => {
    if (!confirm('Remove this user from the project?')) return;
    try {
      await unshareProject.mutateAsync({ id: projectId, userId: memberUserId });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove user');
    }
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <button type="button" className="secondary-button small" onClick={() => navigate('/projects')}>
          Back to projects
        </button>
        <p className="eyebrow">Project</p>
        <h1>{project?.name ?? 'Loading...'}</h1>
        {project?.description && <p>{project.description}</p>}
        {project && (
          <p className="project-meta">
            Owner: <strong>{project.ownerUsername}</strong>
            {members && members.length > 0 && (
              <span> | Shared with {members.length} user{members.length > 1 ? 's' : ''}</span>
            )}
          </p>
        )}
      </header>

      {isOwner && (
        <article className="panel">
          <h2>Share project</h2>
          <form onSubmit={handleShare} className="share-form">
            {shareError && <p className="error">{shareError}</p>}
            <div className="share-form-row">
              <input
                type="text"
                placeholder="Enter username to invite"
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
                className="share-input"
              />
              <button
                type="submit"
                className="primary-button"
                disabled={shareProject.isPending || !shareUsername.trim()}
              >
                {shareProject.isPending ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </form>

          {members && members.length > 0 && (
            <div className="member-list" style={{ marginTop: 12 }}>
              <h3>Members</h3>
              <div className="task-list">
                {members.map((member) => (
                  <article className="task-row" key={member.id}>
                    <div>
                      <strong>{member.username}</strong>
                    </div>
                    <button
                      type="button"
                      className="danger-button small"
                      onClick={() => handleUnshare(member.userId)}
                      disabled={unshareProject.isPending}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>
      )}

      {!isOwner && members && (
        <article className="panel">
          <h2>Project members</h2>
          <div className="task-list">
            <article className="task-row">
              <div><strong>{project?.ownerUsername}</strong> <span>(owner)</span></div>
            </article>
            {members.map((member) => (
              <article className="task-row" key={member.id}>
                <div><strong>{member.username}</strong></div>
              </article>
            ))}
          </div>
        </article>
      )}

      <article className="panel">
        <h2>Select time frame</h2>
        <div className="date-range">
          <label>
            From
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </article>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="metric-grid">
            <article className="metric-card">
              <span>Total time</span>
              <strong>{formatDuration(timeData?.totalDurationSeconds ?? 0)}</strong>
              <p>In selected range</p>
            </article>
            <article className="metric-card">
              <span>Tasks</span>
              <strong>{timeData?.taskCount ?? 0}</strong>
              <p>Unique tasks (deduplicated)</p>
            </article>
          </div>

          <article className="panel">
            <h2>Tracked tasks</h2>
            {tasks && tasks.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                    <th>Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.description}</td>
                      <td>{formatTime(task.startTime)}</td>
                      <td>{task.endTime ? formatTime(task.endTime) : 'Running'}</td>
                      <td>{formatDuration(task.durationSeconds)}</td>
                      <td>{task.projects.map((p) => p.name).join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No tasks for this project in the selected range.</p>
            )}
          </article>
        </>
      )}
    </section>
  );
}

export default ProjectDetailPage;
