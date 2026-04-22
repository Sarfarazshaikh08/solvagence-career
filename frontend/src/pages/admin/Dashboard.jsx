import { useEffect, useState } from 'react'
import { appsAPI, jobsAPI, subsAPI } from '../../api'

const StatCard = ({ icon, label, val, delta, color }) => (
  <div style={{ background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.5rem', position:'relative', overflow:'hidden', maxWidth:'100%', boxSizing:'border-box', wordWrap:'break-word' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: color }} />
    <div style={{ fontSize:'1.75rem', marginBottom:'0.75rem' }}>{icon}</div>
    <div style={{ fontFamily:'Crimson Text,serif', fontSize:'2.4rem', fontWeight:700, lineHeight:1, marginBottom:'0.2rem', wordWrap:'break-word', overflowWrap:'break-word' }}>{val}</div>
    <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', wordWrap:'break-word', overflowWrap:'break-word' }}>{label}</div>
    <div style={{ fontSize:'0.75rem', color:'var(--teal)', marginTop:'0.3rem', wordWrap:'break-word', overflowWrap:'break-word' }}>{delta}</div>
  </div>
)

const BarChart = ({ data, colorFn }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
      {data.map(d => (
        <div key={d.label} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ fontSize:'0.75rem', color:'var(--muted)', width:'clamp(72px, 28vw, 130px)', flexShrink:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.label}</div>
          <div style={{ flex:1, height:8, background:'var(--navy-mid)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${(d.value/max*100).toFixed(0)}%`, background: colorFn ? colorFn(d) : 'linear-gradient(90deg,var(--accent),var(--accent-b))', borderRadius:4, transition:'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--white)', width:24, textAlign:'right' }}>{d.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [jobs,  setJobs]  = useState([])
  const [apps,  setApps]  = useState([])
  const [subs,  setSubs]  = useState([])
  const [load,  setLoad]  = useState(true)

  useEffect(() => {
    Promise.all([
      appsAPI.stats(),
      appsAPI.getAll({ limit: 6 }),
      jobsAPI.adminGetAll(),
      subsAPI.getAll(),
    ]).then(([st, ap, jo, su]) => {
      setStats(st.data.data)
      setApps(ap.data.data)
      setJobs(jo.data.data)
      setSubs(su.data.data)
    }).finally(() => setLoad(false))
  }, [])

  if (load) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner" /></div>

  // Role distribution
  const roleMap = {}
  apps.forEach(a => { roleMap[a.roleTitle] = (roleMap[a.roleTitle] || 0) + 1 })
  const roleBars = Object.entries(roleMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,value]) => ({ label, value }))

  // Location distribution
  const locMap = {}
  apps.forEach(a => { const l = a.location?.replace('UAE – ','') || 'Unknown'; locMap[l] = (locMap[l]||0)+1 })
  const locBars = Object.entries(locMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,value]) => ({ label, value }))
  const scoredCount = apps.filter(a => a.creditScore?.score != null).length
  const scoreCoverage = apps.length ? Math.round(scoredCount / apps.length * 100) : 0
  const unscoredCount = Math.max(apps.length - scoredCount, 0)

  const statusColour = { New:'var(--teal)', Reviewing:'var(--sky)', Shortlisted:'var(--purple)', Hired:'#5EEFD0', Rejected:'var(--coral)' }
  const pipelineData = [
    { label:'Applied',    value: stats.total,       pct:100 },
    { label:'Reviewing',  value: stats.reviewing + stats.shortlisted + stats.hired, pct:70 },
    { label:'Shortlisted',value: stats.shortlisted + stats.hired, pct:40 },
    { label:'Hired',      value: stats.hired,        pct:15 },
  ]

  const card  = { background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.5rem' }
  const ctitle= { fontFamily:'Space Grotesk,sans-serif', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'1.25rem' }

  return (
    <div>
    <div className="dashboard-head" style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'Crimson Text,serif', fontSize:'2rem' }}>Dashboard Overview</h2>
        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:'0.25rem' }}>Solvagence AI Consulting · Careers Portal</p>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stat-grid">
        <StatCard icon="📋" label="Total Applications" val={stats.total}             delta={`${stats.new} new unreviewed`}         color="var(--accent)" />
        <StatCard icon="🆕" label="New / Unreviewed"   val={stats.new}               delta="Requires attention"                     color="var(--teal)" />
        <StatCard icon="✅" label="Hires Made"          val={stats.hired}             delta={`${stats.total} total pipeline`}        color="var(--purple)" />
        <StatCard icon="💼" label="Active Postings"     val={jobs.filter(j=>j.active).length} delta={`${jobs.length} total`}        color="var(--accent)" />
        <StatCard icon="📧" label="Subscribers"         val={subs.length}             delta="Registered talent pool"                 color="var(--teal)" />
        <StatCard icon="🎯" label="Avg Credit Score"    val={stats.avgCreditScore ? `${stats.avgCreditScore}/100` : '—'} delta="Scored profiles" color="var(--sky)" />
      </div>

      {/* Charts Row */}
      <div className="dashboard-two-col">
        <div style={card}>
          <div style={ctitle}>Applications by Role</div>
          {roleBars.length ? <BarChart data={roleBars} /> : <p style={{ color:'var(--muted)', fontSize:'0.82rem' }}>No data yet</p>}
        </div>
        <div style={card}>
          <div style={ctitle}>Hiring Pipeline</div>
          {pipelineData.map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div style={{ fontSize:'0.75rem', color:'var(--muted)', width:'clamp(56px, 22vw, 80px)', flexShrink:0 }}>{s.label}</div>
              <div style={{ flex:1, height:28, background:'var(--navy-mid)', borderRadius:6, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.max(s.pct,6)}%`, background:statusColour[s.label]||'var(--accent)', borderRadius:6, display:'flex', alignItems:'center', paddingLeft:'0.5rem', fontSize:'0.75rem', fontWeight:700, color:'#fff', transition:'width 0.8s ease' }}>
                  {s.value}
                </div>
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--white)', width:28, textAlign:'right' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-two-col">
        <div style={card}>
          <div style={ctitle}>Applications by Location</div>
          {locBars.length ? <BarChart data={locBars} colorFn={() => 'linear-gradient(90deg,var(--teal),var(--sky))'} /> : <p style={{ color:'var(--muted)', fontSize:'0.82rem' }}>No data yet</p>}
        </div>
        <div style={card}>
          <div style={ctitle}>Scoring Coverage</div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:140, height:140, borderRadius:'50%', background:`conic-gradient(var(--teal) 0% ${scoreCoverage}%, var(--navy-mid) ${scoreCoverage}% 100%)`, position:'relative' }}>
              <div style={{ position:'absolute', inset:20, borderRadius:'50%', background:'var(--navy-card)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontFamily:'Crimson Text,serif', fontSize:'1.6rem', fontWeight:700 }}>{scoreCoverage}%</div>
                <div style={{ fontSize:'0.65rem', color:'var(--muted)', fontFamily:'Space Grotesk,sans-serif' }}>Scored</div>
              </div>
            </div>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {[
                ['var(--teal)', 'Profiles scored', `${scoredCount}`],
                ['var(--muted)', 'Profiles pending score', `${unscoredCount}`],
                ['var(--accent)', 'Recent sample size', `${apps.length}`],
              ].map(([c,l,p]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'var(--muted)' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
                  {l} — {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="table-card">
        <div className="table-toolbar">
          <h3>Recent Applications</h3>
          <div className="toolbar-right">
            <a href="/admin/candidates" className="btn-ghost">View All →</a>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Candidate</th><th>Role</th><th>Location</th><th>Date</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {apps.map(a => (
                <tr key={a._id}>
                  <td>
                    <div className="td-name">
                      <div className="avatar">{a.fname[0]}{a.lname[0]}</div>
                      <div><div style={{ fontWeight:600 }}>{a.fname} {a.lname}</div><div className="td-muted">{a.exp}</div></div>
                    </div>
                  </td>
                  <td className="td-muted" style={{ maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.roleTitle}</td>
                  <td className="td-muted">{a.location}</td>
                  <td className="td-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td>
                    {a.creditScore?.score != null
                      ? <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'0.85rem', color: a.creditScore.score>=75?'var(--teal)':a.creditScore.score>=50?'#F59E0B':'var(--coral)' }}>{a.creditScore.score}<span style={{ color:'var(--muted)', fontWeight:400 }}>/100</span></span>
                      : <span style={{ color:'var(--muted)', fontSize:'0.78rem' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
