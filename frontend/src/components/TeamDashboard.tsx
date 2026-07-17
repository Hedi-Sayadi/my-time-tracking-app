import { useProjectTeam } from '../api/projects';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

interface TeamDashboardProps {
  projectId: number;
  ownerUsername: string;
}

function TeamDashboard({ projectId, ownerUsername }: TeamDashboardProps) {
  const { data: contributions, isLoading } = useProjectTeam(projectId);

  if (isLoading) {
    return <p>Loading team data...</p>;
  }

  const totalSeconds = contributions?.reduce((sum, c) => sum + c.totalDurationSeconds, 0) ?? 0;

  return (
    <div className="team-dashboard">
      <div className="metric-grid" style={{ marginBottom: '16px' }}>
        <article className="metric-card">
          <span>Team members</span>
          <strong>{contributions?.length ?? 0}</strong>
          <p>Contributing to this project</p>
        </article>
        <article className="metric-card">
          <span>Total time</span>
          <strong>{formatDuration(totalSeconds)}</strong>
          <p>Combined across all members</p>
        </article>
      </div>

      <div className="team-members">
        {!contributions || contributions.length === 0 ? (
          <p>No contributions recorded yet.</p>
        ) : (
          contributions.map((member) => {
            const pct = totalSeconds > 0 ? (member.totalDurationSeconds / totalSeconds) * 100 : 0;
            return (
              <article key={member.userId} className="panel" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{member.username}</strong>
                    {member.username === ownerUsername && (
                      <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '12px' }}>(owner)</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatDuration(member.totalDurationSeconds)}</strong>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {member.taskCount} task{member.taskCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      height: '100%',
                      background: '#2563eb',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <small style={{ color: '#6b7280' }}>
                  {pct.toFixed(1)}% of total project time
                </small>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TeamDashboard;
