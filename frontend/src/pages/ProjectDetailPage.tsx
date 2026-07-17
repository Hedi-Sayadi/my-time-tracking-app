import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProject, useProjectMembers, useShareProject, useUnshareProject, useProjectBudget } from '../api/projects';
import { useProjectTime, useProjectTasks, exportProjectTasks } from '../api/tasks';
import TeamDashboard from '../components/TeamDashboard';
import { formatTime } from '../utils/datetime';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function toISOLocal(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

type Tab = 'overview' | 'team';

function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState(toISOLocal(weekAgo));
  const [to, setTo] = useState(toISOLocal(today));
  const [filterUserId, setFilterUserId] = useState<number | null>(null);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: budget } = useProjectBudget(projectId);
  const { data: timeData, isLoading: timeLoading } = useProjectTime(
    projectId,
    new Date(from).toISOString(),
    new Date(to).toISOString(),
    filterUserId
  );
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(
    projectId,
    new Date(from).toISOString(),
    new Date(to).toISOString(),
    filterUserId
  );

  const shareProject = useShareProject();
  const unshareProject = useUnshareProject();

  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');

  const isLoading = projectLoading || timeLoading || tasksLoading || membersLoading;
  const isOwner = project?.ownerId === user?.id;

  const uniqueUsers = tasks
    ? Array.from(new Map(tasks.map((t) => [t.userId, { id: t.userId, username: t.username }])).values())
    : [];

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
        {budget && budget.budgetHours != null && (
          <div className="panel" style={{ marginTop: 12, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Budget</span>
              <strong>
                {(budget.spentSeconds / 3600).toFixed(1)}h / {budget.budgetHours}h
              </strong>
            </div>
            <div
              style={{
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (budget.spentSeconds / 3600 / budget.budgetHours) * 100)}%`,
                  height: '100%',
                  background:
                    budget.spentSeconds / 3600 > budget.budgetHours
                      ? '#dc2626'
                      : (budget.spentSeconds / 3600) / budget.budgetHours >= 0.8
                        ? '#f59e0b'
                        : '#2563eb',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {budget.spentSeconds / 3600 > budget.budgetHours && (
              <small style={{ color: '#dc2626' }}>Over budget</small>
            )}
            {(budget.spentSeconds / 3600) / budget.budgetHours >= 0.8 && budget.spentSeconds / 3600 <= budget.budgetHours && (
              <small style={{ color: '#f59e0b' }}>Approaching limit</small>
            )}
          </div>
        )}

        <div className="tab-nav" style={{ marginTop: '16px', display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'overview' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              fontWeight: activeTab === 'overview' ? '600' : '400',
            }}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'team' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'team' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              fontWeight: activeTab === 'team' ? '600' : '400',
            }}
          >
            Team
          </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Select time frame</h2>
              <button
                type="button"
                className="secondary-button"
                onClick={async () => {
                  try {
                    const blob = await exportProjectTasks(projectId, new Date(from).toISOString(), new Date(to).toISOString());
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `project-${projectId}-tasks.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch {
                    alert('Export failed');
                  }
                }}
              >
                Export CSV
              </button>
            </div>
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
                  <p>{filterUserId ? 'For selected user' : 'Across all users'}</p>
                </article>
                <article className="metric-card">
                  <span>Tasks</span>
                  <strong>{timeData?.taskCount ?? 0}</strong>
                  <p>Unique tasks (deduplicated)</p>
                </article>
              </div>

              <article className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ margin: 0 }}>Tracked tasks</h2>
                  {uniqueUsers.length > 0 && (
                    <label className="timer-recent-label" style={{ maxWidth: 280 }}>
                      Filter by user
                      <select
                        className="timer-recent-select"
                        value={filterUserId ?? ''}
                        onChange={(e) => setFilterUserId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">All users</option>
                        {uniqueUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                {tasks && tasks.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>User</th>
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
                          <td>{task.username}</td>
                          <td>{formatTime(task.startTime, user?.timezone)}</td>
                          <td>{task.endTime ? formatTime(task.endTime, user?.timezone) : 'Running'}</td>
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
        </>
      ) : (
        <TeamDashboard
          projectId={projectId}
          ownerUsername={project?.ownerUsername ?? ''}
        />
      )}
    </section>
  );
}

export default ProjectDetailPage;
