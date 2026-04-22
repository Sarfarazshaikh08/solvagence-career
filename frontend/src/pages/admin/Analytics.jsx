import { useEffect, useState } from 'react'
import { appsAPI, jobsAPI, subsAPI } from '../../api'

export function Analytics() {
  const [stats, setStats] = useState(null)
  const [apps,  setApps]  = useState([])
  const [jobs,  setJobs]  = useState([])
  const [subs,  setSubs]  = useState([])
  const [load,  setLoad]  = useState(true)

  useEffect(() => {
    Promise.all([
      appsAPI.stats(),
      appsAPI.getAll({ page: 1, limit: 500 }),
      jobsAPI.adminGetAll(),
      subsAPI.getAll(),
    ])
      .then(([st, ap, jo, su]) => {
        setStats(st.data.data)
        setApps(ap.data.data)
        setJobs(jo.data.data)
        setSubs(su.data.data)
      })
      .finally(() => setLoad(false))
  }, [])

  if (load || !stats) return <div style={{ textAlign:'center', padding:'4rem' }}><div className="spinner" /></div>

  const monthKeys = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date()
    d.setUTCDate(1)
    d.setUTCMonth(d.getUTCMonth() - (5 - idx))
    return d
  })
  const monthData = monthKeys.map(date => {
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const value = apps.filter(app => {
      const created = new Date(app.createdAt)
      return created.getUTCFullYear() === year && created.getUTCMonth() === month
    }).length
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      value,
    }
  })
  const maxMonth = Math.max(...monthData.map(m => m.value), 1)

  const locationGroups = apps.reduce((acc, app) => {
    const raw = app.location || 'Unknown'
    let label = raw
    if (/uae/i.test(raw)) label = 'UAE'
    else if (/india/i.test(raw)) label = 'India'
    else if (/united kingdom|uk/i.test(raw)) label = 'United Kingdom'
    else if (/saudi/i.test(raw)) label = 'Saudi Arabia'
    else if (/qatar/i.test(raw)) label = 'Qatar'
    else if (/oman/i.test(raw)) label = 'Oman'
    else if (/kuwait/i.test(raw)) label = 'Kuwait'
    else if (/bahrain/i.test(raw)) label = 'Bahrain'
    else if (/egypt/i.test(raw)) label = 'Egypt'
    else if (/usa|canada|united states/i.test(raw)) label = 'USA / Canada'
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const locationMix = Object.entries(locationGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value,
      pct: apps.length ? Math.round(value / apps.length * 100) : 0,
    }))

  const expOrder = ['0–2 years', '2–5 years', '5–8 years', '8–12 years', '12+ years']
  const expLabels = {
    '0–2 years': '0–2 yrs',
    '2–5 years': '2–5 yrs',
    '5–8 years': '5–8 yrs',
    '8–12 years': '8–12 yrs',
    '12+ years': '12+ yrs',
  }
  const expCounts = expOrder.map(key => ({
    label: expLabels[key],
    value: apps.filter(app => app.exp === key).length,
  }))
  const maxExp = Math.max(...expCounts.map(e => e.value), 1)

  const statDist  = [['New',stats.new,'var(--teal)'],['Reviewing',stats.reviewing,'var(--sky)'],['Shortlisted',stats.shortlisted,'var(--purple)'],['Hired',stats.hired,'#5EEFD0'],['Rejected',stats.rejected,'var(--coral)']]
  const maxStat   = Math.max(...statDist.map(s=>s[1]),1)
  const convRate  = stats.total ? Math.round(stats.hired/stats.total*100) : 0
  const card = { background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.75rem' }
  const ctitle = { fontFamily:'Space Grotesk,sans-serif', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'1.25rem' }

  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'Crimson Text,serif', fontSize:'2rem' }}>Analytics & Reporting</h2>
        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:'0.25rem' }}>Pipeline performance · Talent pool insights</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[['📥','Total Applications',stats.total,'All time'],['✅','Conversion Rate',`${convRate}%`,'Applied → Hired'],['🎯','Avg Credit Score',stats.avgCreditScore?`${stats.avgCreditScore}/100`:'—','Scored profiles'],['📧','Subscribers',subs.length,'Registered talent pool']].map(([icon,label,val,delta]) => (
          <div key={label} style={{ background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.25rem' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{icon}</div>
            <div style={{ fontFamily:'Crimson Text,serif', fontSize:'2rem', fontWeight:700, lineHeight:1 }}>{val}</div>
            <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginTop:'0.2rem' }}>{label}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--teal)', marginTop:'0.25rem' }}>{delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={card}>
          <div style={ctitle}>Monthly Application Volume</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:150 }}>
            {monthData.map((item) => (
              <div key={item.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem' }}>
                <div style={{ width:'100%', height:`${Math.round(item.value/maxMonth*130)}px`, background:'linear-gradient(180deg,var(--accent),var(--accent-dim))', borderRadius:'4px 4px 0 0', transition:'height 0.6s ease' }} />
                <div style={{ fontSize:'0.65rem', color:'var(--muted)', fontFamily:'Space Grotesk,sans-serif' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={ctitle}>Applicant Location Mix</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {locationMix.length ? locationMix.map(({ label, pct }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--muted)', width:60, flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:8, background:'var(--navy-mid)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--purple),var(--sky))', borderRadius:4 }} />
                </div>
                <span style={{ fontSize:'0.75rem', color:'var(--white)', width:32, textAlign:'right' }}>{pct}%</span>
              </div>
            )) : <p style={{ color:'var(--muted)', fontSize:'0.82rem' }}>No data yet</p>}
          </div>
        </div>
        <div style={card}>
          <div style={ctitle}>Experience Level Distribution</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {expCounts.map(({ label, value }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--muted)', width:70, flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:8, background:'var(--navy-mid)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${value/maxExp*100}%`, background:'linear-gradient(90deg,var(--purple),var(--sky))', borderRadius:4 }} />
                </div>
                <span style={{ fontSize:'0.75rem', color:'var(--white)', width:28, textAlign:'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={ctitle}>Status Distribution</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {statDist.map(([label,val,color]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--muted)', width:80, flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:8, background:'var(--navy-mid)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(val/maxStat*100).toFixed(0)}%`, background:color, borderRadius:4 }} />
                </div>
                <span style={{ fontSize:'0.75rem', color:'var(--white)', width:20, textAlign:'right' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
