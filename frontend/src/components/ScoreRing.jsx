export default function ScoreRing({ score, size = 80 }) {
  if (score === null || score === undefined) {
    return (
      <div className="score-ring-wrap">
        <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--navy-mid)', border: '3px solid var(--border-s)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700 }}>N/A</span>
        </div>
        <span className="score-ring-label">Not Scored</span>
      </div>
    )
  }

  const colour = score >= 75 ? 'var(--score-high)' : score >= 50 ? 'var(--score-mid)' : 'var(--score-low)'
  const radius = (size / 2) - 7
  const circ   = 2 * Math.PI * radius
  const dash   = (score / 100) * circ

  return (
    <div className="score-ring-wrap">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--navy-mid)" strokeWidth="6" />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={colour} strokeWidth="6"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="score-ring-val" style={{ color: colour }}>{score}</div>
      </div>
      <span className="score-ring-label">
        {score >= 75 ? 'Strong Match' : score >= 50 ? 'Partial Match' : 'Weak Match'}
      </span>
    </div>
  )
}
