function ReportsPage() {
  const summaries = [
    { label: 'Today', value: '5h 20m', note: '3 tracked sessions' },
    { label: 'This week', value: '23h 45m', note: 'Focused on project work' },
    { label: 'This month', value: '61h 10m', note: 'Includes lecture prep' },
  ]

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Reports</p>
        <h1>See where the time went across the day, week, or month.</h1>
      </header>

      <article className="panel">
        <h2>Summary view</h2>
        <div className="metric-grid">
          {summaries.map((summary) => (
            <article className="metric-card" key={summary.label}>
              <span>{summary.label}</span>
              <strong>{summary.value}</strong>
              <p>{summary.note}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default ReportsPage