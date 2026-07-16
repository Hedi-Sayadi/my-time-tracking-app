function TasksPage() {
  const tasks = [
    { title: 'Write report outline', project: 'Final project', time: '09:10 - 10:25' },
    { title: 'Read and mark seminar paper', project: 'Seminar HCI', time: '12:30 - 14:35' },
    { title: 'Clean up notes', project: 'Research notes', time: '15:05 - 15:53' },
  ]

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Tasks</p>
        <h1>Review, edit, and organize the time you already tracked.</h1>
      </header>

      <article className="panel">
        <h2>Task list</h2>
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task-row" key={task.title}>
              <div>
                <strong>{task.title}</strong>
                <p>{task.project}</p>
              </div>
              <span>{task.time}</span>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default TasksPage