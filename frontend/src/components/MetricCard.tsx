type MetricCardProps = {
  label: string
  value: string
  note: string
}

function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

export default MetricCard