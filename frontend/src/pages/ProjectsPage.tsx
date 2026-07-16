function ProjectsPage() {
  const projects = [
    { name: 'Final project', note: 'Main work for the semester', time: '18h 10m' },
    { name: 'Software engineering lecture', note: 'Slides, exercises, and report', time: '12h 45m' },
    { name: 'Research notes', note: 'Reading and summaries', time: '6h 20m' },
  ]

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Projects</p>
        <h1>Keep your lectures, seminars, and side work in one place.</h1>
      </header>

      <article className="panel">
        <h2>Project overview</h2>
        <div className="task-list">
          {projects.map((project) => (
            <article className="task-row" key={project.name}>
              <div>
                <strong>{project.name}</strong>
                <p>{project.note}</p>
              </div>
              <span>{project.time}</span>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default ProjectsPage