import { useEffect, useState } from 'react'
import { jobsAPI } from '../../api'
import { toast } from '../../components/Toast'

const DEPTS = ['Engineering','Consulting','Research','Sales','Operations']
const CATS  = { Engineering:'engineering', Consulting:'consulting', Research:'research', Sales:'sales', Operations:'operations' }
const ICONS = { Engineering:'⚙️', Consulting:'🎯', Research:'🧠', Sales:'💼', Operations:'🌟' }
const EMPTY_FORM = { title:'', dept:'Engineering', location:'Dubai, UAE', type:'Full-Time', salMin:'', salMax:'', badge:'', desc:'', requirements:'' }

function JobModal({ job, onClose, onSaved }) {
  const [f, setF] = useState(() => job ? {
    title: job.title || '',
    dept: job.dept || 'Engineering',
    location: job.location || 'Dubai, UAE',
    type: job.type || 'Full-Time',
    salMin: job.salMin ?? '',
    salMax: job.salMax ?? '',
    badge: job.badge || '',
    desc: job.desc || '',
    requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
  } : EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const isEditing = !!job

  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const submit = async () => {
    if (!f.title || !f.location) { toast.error('Title and location required'); return }
    if (f.salMin && f.salMax && Number(f.salMin) > Number(f.salMax)) { toast.error('Salary min cannot exceed salary max'); return }
    setBusy(true)
    try {
      const payload = {
        ...f,
        category: CATS[f.dept] || 'operations',
        icon:     ICONS[f.dept] || '💼',
        salMin:   parseInt(f.salMin)||0,
        salMax:   parseInt(f.salMax)||0,
        requirements: f.requirements.split('\n').filter(Boolean),
      }
      if (isEditing) {
        await jobsAPI.update(job._id, payload)
        toast.success('Role updated!')
      } else {
        await jobsAPI.create(payload)
        toast.success('Role posted!')
      }
      onSaved()
    } catch {
      toast.error(isEditing ? 'Failed to update role' : 'Failed to create role')
    }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:600 }}>
        <div className="modal-head"><h3>{isEditing ? 'Edit Role' : 'Post New Role'}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title <span className="req">*</span></label>
              <input className="form-input" value={f.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Senior AI Engineer" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={f.dept} onChange={e=>set('dept',e.target.value)}>
                {DEPTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location <span className="req">*</span></label>
              <input className="form-input" value={f.location} onChange={e=>set('location',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={f.type} onChange={e=>set('type',e.target.value)}>
                <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Salary Min (AED/yr)</label>
              <input className="form-input" type="number" value={f.salMin} onChange={e=>set('salMin',e.target.value)} placeholder="200000" />
            </div>
            <div className="form-group">
              <label className="form-label">Salary Max (AED/yr)</label>
              <input className="form-input" type="number" value={f.salMax} onChange={e=>set('salMax',e.target.value)} placeholder="350000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Badge</label>
            <select className="form-select" value={f.badge} onChange={e=>set('badge',e.target.value)}>
              <option value="">None</option><option>HOT</option><option>NEW</option><option>FEATURED</option><option>REMOTE</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Role Description</label>
            <textarea className="form-textarea" rows="4" value={f.desc} onChange={e=>set('desc',e.target.value)} placeholder="Describe the role and responsibilities…" />
          </div>
          <div className="form-group">
            <label className="form-label">Requirements (one per line)</label>
            <textarea className="form-textarea" rows="4" value={f.requirements} onChange={e=>set('requirements',e.target.value)} placeholder="5+ years ML experience&#10;Python, PyTorch&#10;LLM deployment experience" />
          </div>
          <div style={{ display:'flex', gap:'1rem' }}>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={submit} disabled={busy}>
              {busy ? <><span className="spinner"/> {isEditing ? 'Saving…' : 'Posting…'}</> : isEditing ? 'Save Changes' : 'Post Role'}
            </button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobPostings() {
  const [jobs,  setJobs]  = useState([])
  const [load,  setLoad]  = useState(true)
  const [modalJob, setModalJob] = useState(null)

  const fetch = async () => {
    setLoad(true)
    try { const r = await jobsAPI.adminGetAll(); setJobs(r.data.data) }
    finally { setLoad(false) }
  }
  useEffect(() => { fetch() }, [])

  const toggle = async (id, active) => {
    try { await jobsAPI.update(id, { active }); fetch(); toast.success(active ? 'Role activated' : 'Role paused') }
    catch { toast.error('Update failed') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this job posting?')) return
    try { await jobsAPI.remove(id); fetch(); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const active = jobs.filter(j=>j.active).length

  const badgeClass = { HOT:'badge-hot', NEW:'badge-new-role', FEATURED:'badge-featured', REMOTE:'badge-remote' }

  return (
    <div>
      {modalJob !== null && <JobModal job={modalJob} onClose={() => setModalJob(null)} onSaved={() => { setModalJob(null); fetch() }} />}

      {/* Stats */}
      <div className="dashboard-stat-grid">
        {[['Total Postings', jobs.length, 'var(--accent)'],['Live / Active', active, 'var(--teal)'],['Paused / Draft', jobs.length - active, 'var(--muted)']].map(([l,v,c]) => (
          <div key={l} style={{ background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'1.25rem', textAlign:'center' }}>
            <div style={{ fontFamily:'Crimson Text,serif', fontSize:'2rem', fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--muted)', fontFamily:'Space Grotesk,sans-serif', marginTop:'0.2rem' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button className="btn-primary" onClick={() => setModalJob(undefined)}>+ Post New Role</button>
      </div>

      {load ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" /></div>
      ) : (
        <div className="jobs-admin-grid">
          {jobs.map(j => (
            <div key={j._id} style={{ background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.5rem', transition:'var(--tr)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                <div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.92rem', fontWeight:700 }}>{j.icon} {j.title}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--accent-pale)', marginTop:'0.2rem' }}>{j.dept}</div>
                </div>
                <span className={`badge ${j.active?'badge-active':'badge-paused'}`}>{j.active?'Live':'Paused'}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', fontSize:'0.78rem', color:'var(--muted)', marginBottom:'0.85rem' }}>
                <span>📍 {j.location}</span>
                <span>💰 AED {(j.salMin/1000).toFixed(0)}K – {(j.salMax/1000).toFixed(0)}K / yr</span>
                <span>📋 {j.appCount || 0} application{j.appCount!==1?'s':''}</span>
                {j.badge && <span><span className={`badge ${badgeClass[j.badge]||''}`}>{j.badge}</span></span>}
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--muted)', lineHeight:1.6, marginBottom:'1rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{j.desc}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.85rem', borderTop:'1px solid var(--border-s)' }}>
                <button className="btn-ghost" onClick={() => setModalJob(j)} style={{ fontSize:'0.72rem', padding:'0.45rem 0.8rem' }}>
                  Edit
                </button>
                <label className="toggle" title={j.active?'Pause':'Activate'}>
                  <input type="checkbox" checked={j.active} onChange={e => toggle(j._id, e.target.checked)} />
                  <span className="toggle-track" />
                </label>
                <button className="btn-icon danger" onClick={() => remove(j._id)} title="Delete posting">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
