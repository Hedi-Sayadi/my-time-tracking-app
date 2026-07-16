const recentTasks = [
  {
    title: 'Organize the project structure',
    project: 'Final project',
    duration: '01:15',
  },
  {
    title: 'Read seminar paper and mark key points',
    project: 'Seminar HCI',
    duration: '02:05',
  },
  {
    title: 'Clean up notes before saving',
    project: 'Research',
    duration: '00:48',
  },
]

function RecentTasks() {
  return (
    <section className="panel" aria-label="Recent tasks">
      <div className="panel-heading">
        <h2>Recent tasks</h2>
        <span>Today</span>
      </div>

      <div className="task-list">
        {recentTasks.map((task) => (
          <article className="task-row" key={task.title}>
            <div>
              <strong>{task.title}</strong>
              <p>{task.project}</p>
            </div>
            <span>{task.duration}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentTasks