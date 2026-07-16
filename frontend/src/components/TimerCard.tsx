function TimerCard() {
  return (
    <section className="hero-card timer-card" aria-label="Active timer">
      <div>
        <p className="eyebrow">Active task</p>
        <h2>Lecture notes and planning</h2>
      </div>

      <div className="timer-display">
        <span>01:42:18</span>
        <small>Running now</small>
      </div>

      <div className="timer-actions">
        <button type="button" className="primary-button">
          Start timer
        </button>
        <button type="button" className="secondary-button">
          Add entry
        </button>
      </div>
    </section>
  )
}

export default TimerCard