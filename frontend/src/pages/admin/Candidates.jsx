import { useEffect, useState, useCallback } from 'react'
import { appsAPI } from '../../api'
import ScoreRing from '../../components/ScoreRing'
import { toast } from '../../components/Toast'

const STATUSES = ['New','Reviewing','Shortlisted','Hired','Rejected']
const STATUS_COLOR = { New:'var(--teal)', Reviewing:'var(--sky)', Shortlisted:'var(--purple)', Hired:'#5EEFD0', Rejected:'var(--coral)' }

/* ── Candidate Detail Panel ──────────────────────────────────────── */
function CandidatePanel({ id, onClose, onUpdate }) {
  const [app,    setApp]    = useState(null)
  const [score,  setScore]  = useState('')
  const [sNote,  setSNote]  = useState('')
  const [rNote,  setRNote]  = useState('')
  const [resumeUrl, setRU]  = useState(null)
  const [tab,    setTab]    = useState('overview')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    appsAPI.getOne(id).then(r => {
      const a = r.data.data
      setApp(a)
      setScore(a.creditScore?.score ?? '')
      setSNote(a.creditScore?.notes  ?? '')
      setRNote(a.recruiterNotes      ?? '')
    })
  }, [id])

  const loadResume = async () => {
    if (resumeUrl) { setTab('resume'); return }
    try {
      const r = await appsAPI.getResumeUrl(id)
      setRU(r.data.url)
      setTab('resume')
    } catch { toast.error('Could not load resume') }
  }

  const saveScore = async () => {
    if (score === '' || score < 0 || score > 100) { toast.error('Enter a score between 0 and 100'); return }
    setSaving(true)
    try {
      const r = await appsAPI.updateScore(id, { score: parseInt(score), notes: sNote })
      setApp(a => ({ ...a, creditScore: r.data.data.creditScore }))
      onUpdate()
      toast.success('Credit score saved')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const saveNotes = async () => {
    try {
      await appsAPI.updateNotes(id, rNote)
      toast.success('Notes saved')
    } catch { toast.error('Save failed') }
  }

  const changeStatus = async (s) => {
    try {
      await appsAPI.updateStatus(id, s)
      setApp(a => ({ ...a, status: s }))
      onUpdate()
      toast.success(`Status → ${s}`)
    } catch { toast.error('Update failed') }
  }

  if (!app) return (
    <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}>
      <div className="spinner" />
    </div>
  )

  const scoreVal = app.creditScore?.score
  const scoreColor = scoreVal == null ? 'var(--muted)' : scoreVal>=75 ? 'var(--teal)' : scoreVal>=50 ? '#F59E0B' : 'var(--coral)'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Head */}
      <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border-s)', display:'flex', alignItems:'center', gap:'1rem', position:'sticky', top:0, background:'var(--navy-card)', zIndex:1 }}>
        <div className="avatar lg">{app.fname[0]}{app.lname[0]}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'1rem', fontWeight:700 }}>{app.fname} {app.lname}</div>
          <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{app.roleTitle}</div>
          <span className={`badge badge-${app.status.toLowerCase()}`} style={{ marginTop:'0.4rem', display:'inline-flex' }}>{app.status}</span>
        </div>
        <ScoreRing score={scoreVal} size={72} />
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      {/* Tabs */}
      <div className="candidate-tabs">
        {['overview','score','notes','resume'].map(t => (
          <button key={t} onClick={() => t === 'resume' ? loadResume() : setTab(t)}
            style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.78rem', fontWeight:700, padding:'0.75rem 1rem', color: tab===t?'var(--accent)':'var(--muted)', borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`, transition:'var(--tr)', background:'none', cursor:'pointer', textTransform:'capitalize' }}>
            {t === 'resume' ? '📄 Resume' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'1.5rem' }}>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.75rem' }}>Contact</div>
              {[['Email', app.email],['Phone', app.phone||'—'],['Location', app.location],['LinkedIn', app.linkedin ? <a href={app.linkedin} target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>View Profile ↗</a> : '—']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem', fontSize:'0.83rem' }}>
                  <span style={{ color:'var(--muted)', minWidth:90, flexShrink:0 }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.75rem' }}>Application</div>
              {[['Role', app.roleTitle],['Experience', app.exp],['Applied', new Date(app.createdAt).toLocaleDateString('en-GB',{ day:'numeric', month:'long', year:'numeric' })],['Has Resume', app.resume?.originalName ? `✓ ${app.resume.originalName}` : '✕ Not uploaded']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem', fontSize:'0.83rem' }}>
                  <span style={{ color:'var(--muted)', minWidth:90, flexShrink:0 }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.75rem' }}>Update Status</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => changeStatus(s)}
                    style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.75rem', fontWeight:700, padding:'0.4rem 0.85rem', borderRadius:100, border:`1px solid ${app.status===s ? STATUS_COLOR[s] : 'var(--border-s)'}`, background: app.status===s ? `${STATUS_COLOR[s]}20` : 'transparent', color: app.status===s ? STATUS_COLOR[s] : 'var(--muted)', cursor:'pointer', transition:'var(--tr)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Credit Score */}
        {tab === 'score' && (
          <div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'2rem' }}>
              <ScoreRing score={scoreVal} size={100} />
              {app.creditScore?.scoredBy && (
                <div style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:'var(--muted)' }}>
                  Scored by {app.creditScore.scoredBy} · {new Date(app.creditScore.scoredAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div style={{ background:'var(--navy-mid)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                <label style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.75rem', fontWeight:700, color:'var(--accent-pale)' }}>Profile Match Score</label>
                <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'1.5rem', fontWeight:800, color: scoreColor }}>
                  {score !== '' ? score : '—'}
                  <span style={{ fontSize:'0.85rem', color:'var(--muted)', fontWeight:400 }}>/100</span>
                </span>
              </div>
              <input type="range" className="score-slider" min="0" max="100" value={score||0}
                onChange={e => setScore(e.target.value)} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.68rem', color:'var(--muted)', marginTop:'0.4rem' }}>
                <span>Weak Match</span><span>Partial Match</span><span>Strong Match</span>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
              <input type="number" className="form-input" style={{ width:100 }} min="0" max="100" value={score}
                onChange={e => setScore(e.target.value)} placeholder="0–100" />
              <span style={{ fontSize:'0.82rem', color:'var(--muted)' }}>
                {score>=75 ? '🟢 Strong Match' : score>=50 ? '🟡 Partial Match' : score>0 ? '🔴 Weak Match' : 'Enter score'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Scoring Notes</label>
              <textarea className="form-textarea" rows="4" value={sNote} onChange={e => setSNote(e.target.value)}
                placeholder="Explain the score — what aligns, what's missing, key strengths…" />
            </div>

            <button className="btn-primary" onClick={saveScore} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>
              {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Credit Score'}
            </button>
          </div>
        )}

        {/* Recruiter Notes */}
        {tab === 'notes' && (
          <div>
            <p style={{ fontSize:'0.83rem', color:'var(--muted)', marginBottom:'1rem' }}>Internal recruiter notes — not visible to the candidate.</p>
            <div className="form-group">
              <label className="form-label">Recruiter Notes</label>
              <textarea className="form-textarea" rows="10" value={rNote} onChange={e => setRNote(e.target.value)}
                placeholder="Add notes about interview feedback, referral source, visa situation, salary expectations…" />
            </div>
            <button className="btn-primary" onClick={saveNotes} style={{ width:'100%', justifyContent:'center' }}>
              💾 Save Notes
            </button>
          </div>
        )}

        {/* Resume Preview */}
        {tab === 'resume' && (
          <div>
            {app.resume?.originalName ? (
              resumeUrl ? (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div>
                      <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>{app.resume.originalName}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                        {(app.resume.sizeBytes/1024).toFixed(0)} KB · Uploaded {new Date(app.resume.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a href={resumeUrl} target="_blank" rel="noreferrer" download={app.resume.originalName} className="btn-ghost">⬇ Download</a>
                  </div>
                  {app.resume.mimeType === 'application/pdf' ? (
                    <div className="resume-preview-wrap">
                      <iframe src={resumeUrl} title="Resume Preview" />
                    </div>
                  ) : (
                    <div style={{ background:'var(--navy-mid)', borderRadius:'var(--r)', padding:'3rem', textAlign:'center' }}>
                      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📝</div>
                      <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, marginBottom:'0.5rem' }}>Word Document</div>
                      <p style={{ fontSize:'0.83rem', color:'var(--muted)', marginBottom:'1.5rem' }}>Preview unavailable for .doc/.docx — download to view.</p>
                      <a href={resumeUrl} target="_blank" rel="noreferrer" download={app.resume.originalName} className="btn-primary">⬇ Download Resume</a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'3rem' }}>
                  <div className="spinner" />
                  <p style={{ color:'var(--muted)', marginTop:'1rem', fontSize:'0.83rem' }}>Loading resume…</p>
                </div>
              )
            ) : (
              <div style={{ textAlign:'center', padding:'3rem 2rem', background:'var(--navy-mid)', borderRadius:'var(--r)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📭</div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, marginBottom:'0.4rem' }}>No Resume Uploaded</div>
                <p style={{ fontSize:'0.82rem', color:'var(--muted)' }}>This candidate did not attach a resume with their application.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Main Candidates Page ──────────────────────────────────────────── */
export default function Candidates() {
  const [apps,   setApps]   = useState([])
  const [total,  setTotal]  = useState(0)
  const [pages,  setPages]  = useState(1)
  const [page,   setPage]   = useState(1)
  const [q,      setQ]      = useState('')
  const [status, setStatus] = useState('all')
  const [load,   setLoad]   = useState(true)
  const [selId,  setSelId]  = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const fetchApps = useCallback(async (pg = page) => {
    setLoad(true)
    try {
      const r = await appsAPI.getAll({ page: pg, limit: 10, q: q || undefined, status: status !== 'all' ? status : undefined })
      setApps(r.data.data); setTotal(r.data.total); setPages(r.data.pages)
    } finally { setLoad(false) }
  }, [page, q, status])

  useEffect(() => { fetchApps(1); setPage(1) }, [q, status])
  useEffect(() => { fetchApps(page) }, [page])

  const openPanel = (id) => { setSelId(id); setPanelOpen(true) }
  const closePanel = () => { setPanelOpen(false); setSelId(null) }

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return
    try { await appsAPI.remove(id); fetchApps(page); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const quickStatus = async (id, s) => {
    try { await appsAPI.updateStatus(id, s); fetchApps(page); toast.success(`→ ${s}`) }
    catch { toast.error('Update failed') }
  }

  const exportCSV = () => {
    const rows = [['First Name','Last Name','Email','Phone','Location','Role','Experience','Status','Score','Date']]
    apps.forEach(a => rows.push([a.fname,a.lname,a.email,a.phone||'',a.location,a.roleTitle,a.exp,a.status,a.creditScore?.score??'',new Date(a.createdAt).toLocaleDateString()]))
    const csv = rows.map(r => r.map(v=>`"${v}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    const a = document.createElement('a'); a.href=url; a.download='solvagence_candidates.csv'; a.click()
  }

  return (
    <div style={{ position:'relative' }}>
      {/* Panel overlay */}
      {panelOpen && (
        <>
          <div onClick={closePanel} style={{ position:'fixed', inset:0, background:'rgba(7,9,26,0.7)', zIndex:900, backdropFilter:'blur(4px)' }} />
          <div className="candidate-panel-shell" style={{ position:'fixed', right:0, top:0, bottom:0, width:480, background:'var(--navy-card)', borderLeft:'1px solid var(--border)', zIndex:901, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'var(--shadow)' }}>
            {selId && <CandidatePanel id={selId} onClose={closePanel} onUpdate={fetchApps} />}
          </div>
        </>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <h3>All Candidates <span style={{ color:'var(--muted)', fontWeight:400, fontSize:'0.8rem' }}>({total})</span></h3>
          <div className="toolbar-right">
            <input className="admin-input" placeholder="Search name, email, role…" value={q} onChange={e => setQ(e.target.value)} style={{ width:'min(260px, 100%)' }} />
            <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-ghost" onClick={exportCSV}>⬇ CSV</button>
          </div>
        </div>

        {load ? (
          <div style={{ padding:'3rem', textAlign:'center' }}><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Candidate</th><th>Email</th><th>Role</th><th>Location</th><th>Date</th><th>Status</th><th>Score</th><th>Resume</th><th></th></tr>
              </thead>
              <tbody>
                {apps.length ? apps.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="td-name">
                        <div className="avatar">{a.fname[0]}{a.lname[0]}</div>
                        <div>
                          <div style={{ fontWeight:600 }}>{a.fname} {a.lname}</div>
                          <div className="td-muted">{a.exp}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">{a.email}</td>
                    <td className="td-muted" style={{ maxWidth:150, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.roleTitle}</td>
                    <td className="td-muted">{a.location}</td>
                    <td className="td-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select className="admin-select" style={{ fontSize:'0.75rem', padding:'0.3rem 1.5rem 0.3rem 0.5rem' }}
                        value={a.status} onChange={e => quickStatus(a._id, e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {a.creditScore?.score != null
                        ? <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, color: a.creditScore.score>=75?'var(--teal)':a.creditScore.score>=50?'#F59E0B':'var(--coral)' }}>{a.creditScore.score}<span style={{ color:'var(--muted)', fontWeight:400 }}>/100</span></span>
                        : <span style={{ color:'var(--muted)', fontSize:'0.78rem' }}>—</span>}
                    </td>
                    <td>
                      {a.resume?.originalName
                        ? <span title={a.resume.originalName} style={{ fontSize:'1.1rem' }}>📄</span>
                        : <span style={{ color:'var(--muted)', fontSize:'0.75rem' }}>None</span>}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.35rem' }}>
                        <button className="btn-icon" onClick={() => openPanel(a._id)} title="View / Score">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="btn-icon danger" onClick={() => deleteApp(a._id)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>No candidates found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span>Showing {apps.length} of {total}</span>
          <div className="pag-btns">
            {Array.from({ length: pages }, (_,i) => i+1).map(p => (
              <button key={p} className={`pag-btn${p===page?' active':''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
