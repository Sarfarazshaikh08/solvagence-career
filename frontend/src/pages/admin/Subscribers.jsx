import { useEffect, useState } from 'react'
import { subsAPI } from '../../api'
import { toast } from '../../components/Toast'

export default function Subscribers() {
  const [subs,  setSubs]  = useState([])
  const [q,     setQ]     = useState('')
  const [load,  setLoad]  = useState(true)

  const fetch = async () => {
    setLoad(true)
    try { const r = await subsAPI.getAll({ q: q||undefined }); setSubs(r.data.data) }
    finally { setLoad(false) }
  }

  useEffect(() => { fetch() }, [q])

  const remove = async (id) => {
    if (!confirm('Remove subscriber?')) return
    try { await subsAPI.remove(id); fetch(); toast.success('Removed') }
    catch { toast.error('Failed') }
  }

  const exportCSV = () => {
    const rows = [['First','Last','Email','Phone','Location','Interest','LinkedIn','Marketing','Date']]
    subs.forEach(s => rows.push([s.fname,s.lname,s.email,s.phone||'',s.location,s.interest,s.linkedin||'',s.marketing?'Yes':'No',new Date(s.createdAt).toLocaleDateString()]))
    const csv = rows.map(r => r.map(v=>`"${v}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    const a = document.createElement('a'); a.href=url; a.download='solvagence_subscribers.csv'; a.click()
  }

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <h3>Career Alert Subscribers <span style={{ color:'var(--muted)', fontWeight:400, fontSize:'0.8rem' }}>({subs.length})</span></h3>
        <div className="toolbar-right">
          <input className="admin-input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} style={{ minWidth:200 }} />
          <button className="btn-ghost" onClick={exportCSV}>⬇ CSV</button>
        </div>
      </div>
      {load ? (
        <div style={{ padding:'3rem', textAlign:'center' }}><div className="spinner" /></div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Location</th><th>Interest</th><th>Subscribed</th><th>Marketing</th><th></th></tr></thead>
            <tbody>
              {subs.length ? subs.map(s => (
                <tr key={s._id}>
                  <td><div className="td-name"><div className="avatar">{s.fname[0]}{s.lname[0]}</div>{s.fname} {s.lname}</div></td>
                  <td className="td-muted">{s.email}</td>
                  <td className="td-muted">{s.location}</td>
                  <td style={{ color:'var(--accent-pale)', fontSize:'0.82rem' }}>{s.interest}</td>
                  <td className="td-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${s.marketing?'badge-active':'badge-paused'}`}>{s.marketing?'Yes':'No'}</span></td>
                  <td>
                    <button className="btn-icon danger" onClick={() => remove(s._id)} title="Remove">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>No subscribers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
