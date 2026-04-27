import { useState, useEffect, useRef } from 'react'
import { jobsAPI, appsAPI, subsAPI, settingsAPI } from '../api'
import ResumeUpload from '../components/ResumeUpload'
import { ToastProvider, toast } from '../components/Toast'

/* ── Particles canvas ─────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = [], raf
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    const mk = () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.5+0.3, dx:(Math.random()-.5)*0.4, dy:-(Math.random()*0.5+0.1), alpha:Math.random()*0.5+0.1 })
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(58,123,255,${p.alpha})`; ctx.fill()
        p.x+=p.dx; p.y+=p.dy
        if(p.y<-5||p.x<-5||p.x>W+5) Object.assign(p,mk(),{y:H+5,x:Math.random()*W})
      })
      raf = requestAnimationFrame(draw)
    }
    resize(); window.addEventListener('resize',resize)
    particles = Array.from({length:80},mk); draw()
    return () => { window.removeEventListener('resize',resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none' }} />
}

/* ── Status badge  ─────────────────────────────────────────────── */
const badgeMap = { HOT:['badge-hot','🔥 HOT'], NEW:['badge-new-role','✨ NEW'], FEATURED:['badge-featured','⭐ FEATURED'], REMOTE:['badge-remote','🌍 REMOTE'] }

/* ── Job Apply Modal ─────────────────────────────────────────────── */
function JobModal({ job, onClose }) {
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ fname:'',lname:'',email:'',phone:'',location:'',exp:'',linkedin:'' })
  const [resume, setResume] = useState(null)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!job) return null
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = async () => {
    if (!form.fname||!form.lname||!form.email||!form.location||!form.exp) { toast.error('Please fill in all required fields'); return }
    if (!consent) { toast.error('PDPL consent is required'); return }
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k,v))
      fd.append('jobId', job._id)
      fd.append('consent', 'true')
      if (resume) fd.append('resume', resume)
      await appsAPI.submit(fd)
      setDone(true)
      toast.success('Application submitted!')
    } catch(e) { toast.error(e.response?.data?.message || 'Submission failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:640 }}>
        <div className="modal-head">
          <h3>{job.icon} {job.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-tabs">
          {['overview','requirements','apply'].map(t => (
            <div key={t} className={`modal-tab${tab===t?' active':''}`} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>{t}</div>
          ))}
        </div>
        <div className="modal-body">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>
                  <span style={{ color:'var(--accent-pale)', fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>{job.dept} · {job.type}</span> &nbsp;·&nbsp; 📍 {job.location}
                </div>
              </div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', lineHeight:1.85, marginBottom:'1.5rem' }}>{job.desc}</p>
              <button className="btn-primary" onClick={() => setTab('apply')}>Apply for This Role →</button>
            </div>
          )}
          {/* Requirements */}
          {tab === 'requirements' && (
            <div>
              <h4 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', marginBottom:'1rem' }}>What We're Looking For</h4>
              <ul style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {(job.requirements||[]).map((r,i) => (
                  <li key={i} style={{ display:'flex', gap:'0.75rem', fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.6 }}>
                    <span style={{ color:'var(--teal)', flexShrink:0 }}>✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Apply */}
          {tab === 'apply' && (
            done ? (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🎉</div>
                <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.8rem', marginBottom:'0.5rem' }}>Application Received!</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>We'll review your profile within 5 business days. Good luck!</p>
              </div>
            ) : (
              <div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">First Name <span className="req">*</span></label><input className="form-input" value={form.fname} onChange={e=>set('fname',e.target.value)} placeholder="Ahmed" /></div>
                  <div className="form-group"><label className="form-label">Last Name <span className="req">*</span></label><input className="form-input" value={form.lname} onChange={e=>set('lname',e.target.value)} placeholder="Al Mansouri" /></div>
                </div>
                <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.ae" /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+971 50 000 0000" /></div>
                  <div className="form-group"><label className="form-label">Location <span className="req">*</span></label>
                    <select className="form-select" value={form.location} onChange={e=>set('location',e.target.value)}>
                      <option value="">Select…</option>
                      {['UAE – Dubai','UAE – Abu Dhabi','UAE – Other','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','Egypt','India','United Kingdom','USA / Canada','Other'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Years of Experience <span className="req">*</span></label>
                  <select className="form-select" value={form.exp} onChange={e=>set('exp',e.target.value)}>
                    <option value="">Select…</option>
                    {['0–2 years','2–5 years','5–8 years','8–12 years','12+ years'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">LinkedIn Profile</label><input className="form-input" type="url" value={form.linkedin} onChange={e=>set('linkedin',e.target.value)} placeholder="https://linkedin.com/in/yourname" /></div>
                <div className="form-group">
                  <label className="form-label">Resume / CV <span style={{ color:'var(--teal)', fontSize:'0.7rem' }}>(PDF, DOC, DOCX · Max 10MB)</span></label>
                  <ResumeUpload file={resume} onChange={setResume} />
                </div>
                <div className="form-check">
                  <input type="checkbox" id="modal-consent" checked={consent} onChange={e=>setConsent(e.target.checked)} />
                  <label className="form-check-label" htmlFor="modal-consent">
                    I consent to Solvagence AI Consulting processing my data for recruitment under <span style={{ color:'var(--accent)' }}>UAE PDPL</span> and <span style={{ color:'var(--accent)' }}>DIFC Data Protection Law 2020</span>. <span className="req">*</span>
                  </label>
                </div>
                <button className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }} onClick={submit} disabled={busy}>
                  {busy ? <><span className="spinner"/> Submitting…</> : '🚀 Submit Application'}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main public page ─────────────────────────────────────────── */
export default function CareersPage() {
  const [jobs, setJobs]       = useState([])
  const [jobsError, setJobsError] = useState('')
  const [filter, setFilter]   = useState('all')
  const [q, setQ]             = useState('')
  const [selJob, setSelJob]   = useState(null)
  const [subForm, setSubForm] = useState({ fname:'',lname:'',email:'',phone:'',location:'',interest:'',linkedin:'',marketing:false,consentGiven:false })
  const [subBusy, setSubBusy] = useState(false)
  const [subDone, setSubDone] = useState(false)
  const [modal, setModal]     = useState(null) // 'privacy'|'terms'|'equal'
  const [menuOpen, setMenuOpen] = useState(false)
  const [publicContent, setPublicContent] = useState({
    hero: {
      badgeText: "We're Hiring · DIFC Dubai & Remote",
      titleLine1: 'Build the AI Future',
      titleLine2: 'from the Heart',
      titleLine3: 'of the Gulf',
      subtitle: "Solvagence AI Consulting is the GCC's premier enterprise AI transformation firm — headquartered in DIFC Dubai, operating across 12+ countries.",
      ctaPrimary: 'View Open Roles',
      ctaSecondary: 'Get Career Alerts',
      stats: [
        { value: '35+', label: 'Open Positions' },
        { value: '12+', label: 'Countries Active' },
        { value: '92%', label: 'Team Satisfaction' },
        { value: '4×', label: 'YoY Growth' },
      ],
    },
    sections: {
      openRolesTitle: 'Find Your Role',
      openRolesDesc: 'From frontier AI engineering to C-suite consulting — exceptional people, exceptional work.',
      whyTitle: 'Where Excellence Meets Purpose',
      benefitsTitle: 'Rewarding Excellence at Every Level',
      processTitle: 'Transparent, Respectful & Fast',
      signupTitle: 'Get Early Access to New Roles',
    },
    whyJoinUs: [
      { icon:'🌍', title:'Global Impact, DIFC Prestige', desc:"Work from the heart of Dubai's premier financial district while shaping AI adoption across 12+ countries. Your work matters globally." },
      { icon:'💸', title:'Tax-Free, Top-Tier Pay', desc:'Benchmarked against McKinsey, Accenture, and FAANG. UAE offers 0% income tax. Packages include bonuses, equity, and comprehensive benefits.' },
      { icon:'🚀', title:'Hypergrowth & Ownership', desc:'4× YoY growth. Every team member owns meaningful scope from day one. Direct access to leadership.' },
      { icon:'🤖', title:'Frontier AI Work', desc:"Engage with cutting-edge LLMs, custom model development, and enterprise AI deployments for the GCC's largest institutions." },
    ],
    benefits: [
      { icon:'💰', title:'Competitive Salary + Bonus', desc:'Tax-free AED income benchmarked globally. 10–30% annual bonus + spot awards.' },
      { icon:'✈️', title:'UAE Visa & Relocation', desc:'Full sponsorship, Emirates ID, one-way airfare, and temporary housing for international joiners.' },
      { icon:'🏥', title:'Premium Health Insurance', desc:'DHA-compliant medical cover for you and dependents. Dental, optical, mental health — fully funded.' },
      { icon:'📚', title:'AED 15,000 Learning Budget', desc:'Certifications, conferences, courses, books. 100% employer-sponsored. Partial rollover.' },
    ],
    hiringJourney: [
      { num:'01', title:'Apply Online', desc:'Submit your application with your CV in under 10 minutes.' },
      { num:'02', title:'Talent Review', desc:'Our team reviews within 5 business days.' },
      { num:'03', title:'Intro Call', desc:'30-minute video call to understand your story.' },
      { num:'04', title:'HM Interview', desc:'Deep dive interview with your future manager.' },
    ],
    footer: {
      blurb: 'Enterprise AI transformation, headquartered in DIFC Dubai. Building the AI future across GCC, Middle East, India, and USA.',
      locationBadge: 'DIFC, Dubai, UAE',
    },
  })
  const [company, setCompany] = useState({
    careersEmail: 'careers@solvagence.com',
  })

  const setSF = (k,v) => setSubForm(p=>({...p,[k]:v}))

  useEffect(() => {
    setJobsError('')
    jobsAPI.getPublic({ category: filter !== 'all' ? filter : undefined, q: q||undefined })
      .then(r => setJobs(r.data.data))
      .catch((e) => {
        setJobs([])
        setJobsError(e?.response?.data?.message || 'Unable to load open roles right now.')
      })
  }, [filter, q])

  useEffect(() => {
    const fetchSettings = () => {
      settingsAPI.getPublic()
        .then(r => {
          const d = r.data.data
          if (d?.publicContent) {
            setPublicContent(prev => ({
              ...prev,
              ...d.publicContent,
              hero: { ...prev.hero, ...(d.publicContent.hero || {}) },
              sections: { ...prev.sections, ...(d.publicContent.sections || {}) },
              footer: { ...prev.footer, ...(d.publicContent.footer || {}) },
              whyJoinUs: Array.isArray(d.publicContent.whyJoinUs) && d.publicContent.whyJoinUs.length ? d.publicContent.whyJoinUs : prev.whyJoinUs,
              benefits: Array.isArray(d.publicContent.benefits) && d.publicContent.benefits.length ? d.publicContent.benefits : prev.benefits,
              hiringJourney: Array.isArray(d.publicContent.hiringJourney) && d.publicContent.hiringJourney.length ? d.publicContent.hiringJourney : prev.hiringJourney,
            }))
          }
          if (d?.company) setCompany({ careersEmail: d.company.careersEmail || 'careers@solvagence.com' })
        })
        .catch(() => {})
    }
    
    fetchSettings() // Fetch on mount
    const interval = setInterval(fetchSettings, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const submitSub = async (e) => {
    e.preventDefault()
    if (!subForm.fname||!subForm.lname||!subForm.email||!subForm.location||!subForm.interest) { toast.error('Please fill all required fields'); return }
    if (!subForm.consentGiven) { toast.error('Recruitment consent is required'); return }
    setSubBusy(true)
    try { await subsAPI.subscribe(subForm); setSubDone(true); toast.success('Registered for alerts!') }
    catch(e) { toast.error(e.response?.data?.message || 'Submission failed') }
    finally { setSubBusy(false) }
  }

  const s = {
    header: { position:'fixed', top:0, left:0, right:0, zIndex:900, height:72, display:'flex', alignItems:'center', padding:'0 2rem', background:'rgba(7,9,26,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border-s)' },
    hInner: { maxWidth:1200, width:'100%', margin:'0 auto', display:'flex', alignItems:'center', gap:'2rem' },
    logo:   { display:'flex', alignItems:'center', gap:'0.75rem', fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'1.05rem', flexShrink:0, cursor:'pointer' },
    lm:     { width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--sky))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'0.85rem' },
    card:   { background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.75rem', transition:'var(--tr)', cursor:'pointer' },
  }

  const filters = [['all','All Roles'],['engineering','Engineering'],['consulting','Consulting'],['research','Research'],['sales','Sales'],['operations','Operations']]

  return (
    <div>
      <ToastProvider />

      {/* Header */}
      <header style={s.header}>
        <div className="careers-header-inner" style={s.hInner}>
          <div style={s.logo} onClick={() => { setMenuOpen(false); window.scrollTo({top:0,behavior:'smooth'}) }}>
            <img src="/Solvagence-Logo.png" alt="Solvagence Logo" style={{ height: 36, width: 'auto' }} />
            <span>SOLVAGENCE <span style={{ color:'var(--accent)' }}>CAREERS</span></span>
          </div>
          <nav className="careers-nav" style={{ display:'flex', gap:'0.25rem', marginLeft:'auto' }}>
            {[['#open-roles','Open Roles'],['#why','Why Us'],['#benefits','Benefits'],['#process','Process'],['#signup','Alerts']].map(([h,l]) => (
              <a key={h} href={h} style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.82rem', fontWeight:600, color:'var(--muted)', padding:'0.45rem 0.9rem', borderRadius:6, transition:'var(--tr)' }}
                onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--muted)'} onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </nav>
          <a className="careers-admin-link" href="/admin/login" style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.78rem', fontWeight:700, color:'var(--accent)', padding:'0.45rem 1.1rem', borderRadius:6, border:'1px solid var(--border)', transition:'var(--tr)' }}>Admin ↗</a>
          <button className="careers-menu-btn" onClick={() => setMenuOpen(open => !open)} aria-label="Toggle navigation">
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="careers-mobile-nav">
            {[['#open-roles','Open Roles'],['#why','Why Us'],['#benefits','Benefits'],['#process','Process'],['#signup','Alerts']].map(([h,l]) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <a href="/admin/login" onClick={() => setMenuOpen(false)}>Admin Portal ↗</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="hero-section" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 2rem 80px', overflow:'hidden' }}>
        <Particles />
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:800, height:800, background:'radial-gradient(ellipse,rgba(58,123,255,0.1) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div className="hero-inner" style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto', width:'100%' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'rgba(58,123,255,0.1)', border:'1px solid var(--border)', borderRadius:100, padding:'0.45rem 1rem 0.45rem 0.7rem', fontFamily:'Space Grotesk,sans-serif', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent-pale)', marginBottom:'1.75rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:'pulse 2s infinite' }} />
            {publicContent.hero.badgeText}
          </div>
          <h1 style={{ fontSize:'clamp(2.6rem,5.5vw,4.8rem)', fontWeight:700, marginBottom:'1.5rem', lineHeight:1.08, maxWidth:700 }}>
            {publicContent.hero.titleLine1}
            <br/>{publicContent.hero.titleLine2}<br/>{publicContent.hero.titleLine3}
          </h1>
          <p style={{ fontSize:'1.1rem', color:'var(--muted)', marginBottom:'2.5rem', maxWidth:520, lineHeight:1.75 }}>
            {publicContent.hero.subtitle}
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'3rem' }}>
            <a href="#open-roles" className="btn-primary">🔍 {publicContent.hero.ctaPrimary}</a>
            <a href="#signup" className="btn-secondary">{publicContent.hero.ctaSecondary}</a>
          </div>
          <div className="hero-stats" style={{ display:'flex', gap:'2.5rem', flexWrap:'wrap', paddingTop:'2.5rem', borderTop:'1px solid var(--border-s)' }}>
            {(publicContent.hero.stats || []).map((item, idx) => (
              <div key={`${item.label}-${idx}`}>
                <div style={{ fontFamily:'Crimson Text,serif', fontSize:'2.2rem', fontWeight:700, lineHeight:1 }}>{item.value}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:'0.3rem' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="section" style={{ background:'var(--navy-mid)' }}>
        <div className="inner">
          <div className="section-head">
            <div className="eyebrow">Open Positions</div>
            <h2 className="section-title">{publicContent.sections.openRolesTitle}</h2>
            <p className="section-desc">{publicContent.sections.openRolesDesc}</p>
            <div className="divider" />
          </div>
          <input className="form-input" style={{ marginBottom:'1rem', maxWidth:500 }} placeholder="Search roles, skills, keywords…" value={q} onChange={e=>setQ(e.target.value)} />
          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginBottom:'2rem' }}>
            {filters.map(([val,label]) => (
              <button key={val} onClick={() => setFilter(val)}
                style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.06em', padding:'0.45rem 1rem', borderRadius:100, border:`1px solid ${filter===val?'var(--accent)':'var(--border-s)'}`, color:filter===val?'var(--accent)':'var(--muted)', background:filter===val?'rgba(58,123,255,0.1)':'var(--navy-card)', cursor:'pointer', transition:'var(--tr)' }}>
                {label}
              </button>
            ))}
          </div>
          {jobsError && (
            <div style={{ marginBottom:'1rem', color:'#ffb4b4', fontSize:'0.85rem' }}>
              {jobsError}
            </div>
          )}
          <div className="roles-grid">
            {jobs.length ? jobs.map(j => (
              <div key={j._id} style={s.card} onClick={() => setSelJob(j)}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-a)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-s)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                  <div style={{ width:46, height:46, borderRadius:10, background:'linear-gradient(135deg,var(--accent-dim),var(--navy-light))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{j.icon}</div>
                  {j.badge && <span className={`badge ${badgeMap[j.badge]?.[0]||''}`}>{badgeMap[j.badge]?.[1]||j.badge}</span>}
                </div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'0.35rem' }}>{j.title}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--accent-pale)', marginBottom:'1rem' }}>{j.dept}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', marginBottom:'1.25rem' }}>
                  {[['📍',j.location],['💼',j.type],['📅',`Posted ${new Date(j.createdAt).toLocaleDateString()}`]].map(([ic,txt]) => (
                    <div key={txt} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', color:'var(--muted)' }}><span>{ic}</span>{txt}</div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'1rem', borderTop:'1px solid var(--border-s)' }}>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.8rem', color:'var(--muted)' }}>{j.type}</span>
                  <button className="btn-primary" style={{ fontSize:'0.75rem', padding:'0.5rem 1rem' }}>Apply →</button>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'4rem 2rem', color:'var(--muted)' }}>
                <h3 style={{ color:'var(--white)', fontFamily:'Space Grotesk,sans-serif', marginBottom:'0.5rem' }}>No roles found</h3>
                <p>Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Solvagence */}
      <section id="why" className="section">
        <div className="inner">
          <div className="section-head c">
            <div className="eyebrow">Why Join Us</div>
            <h2 className="section-title">{publicContent.sections.whyTitle}</h2>
            <p className="section-desc">We don't just offer jobs — we offer a mission.</p>
            <div className="divider c" />
          </div>
          <div className="feature-grid">
            {(publicContent.whyJoinUs || []).map(({ icon, title, desc }) => (
              <div key={title} style={{ background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'2rem', transition:'var(--tr)', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-s)';e.currentTarget.style.transform='none'}}>
                <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>{icon}</div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.95rem', fontWeight:700, marginBottom:'0.6rem' }}>{title}</div>
                <p style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="section" style={{ background:'var(--navy-mid)' }}>
        <div className="inner">
          <div className="section-head">
            <div className="eyebrow">Compensation & Benefits</div>
            <h2 className="section-title">{publicContent.sections.benefitsTitle}</h2>
            <p className="section-desc">Top-quartile packages benchmarked against the best global firms.</p>
            <div className="divider" />
          </div>
          <div className="benefits-grid">
            {(publicContent.benefits || []).map(({ icon, title, desc }) => (
              <div key={title} style={{ display:'flex', gap:'1rem', padding:'1.25rem', background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r)', transition:'var(--tr)' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-s)'}>
                <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,var(--accent-dim),var(--navy-light))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', flexShrink:0 }}>{icon}</div>
                <div><div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', fontWeight:700, marginBottom:'0.3rem' }}>{title}</div><p style={{ fontSize:'0.8rem', color:'var(--muted)', lineHeight:1.65 }}>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section id="process" className="section">
        <div className="inner">
          <div className="section-head c">
            <div className="eyebrow">Our Hiring Journey</div>
            <h2 className="section-title">{publicContent.sections.processTitle}</h2>
            <p className="section-desc">We respect your time. Most roles close in under 3 weeks from first application.</p>
            <div className="divider c" />
          </div>
          <div className="process-grid">
            {(publicContent.hiringJourney || []).map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign:'center', padding:'2rem 1.5rem', background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', transition:'var(--tr)' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-s)';e.currentTarget.style.transform='none'}}>
                <span style={{ fontFamily:'Crimson Text,serif', fontSize:'2.4rem', fontWeight:700, color:'var(--accent)', display:'block', marginBottom:'0.75rem' }}>{num}</span>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', fontWeight:700, marginBottom:'0.5rem' }}>{title}</div>
                <p style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Alerts Signup */}
      <section id="signup" className="section">
        <div className="inner">
          <div className="signup-grid">
            <div>
              <div className="section-head">
                <div className="eyebrow">Stay in the Loop</div>
                <h2 className="section-title">{publicContent.sections.signupTitle}</h2>
                <p className="section-desc">Many of our best roles are filled before they're publicly announced. Register and be first.</p>
                <div className="divider" />
              </div>
              {[['📬','Priority Notifications','Matched roles delivered 1–2 weeks before public posting.'],['🎯','Personalised Matching','We hand-match your profile — no spam, only what fits.'],['🔒','PDPL & DIFC DPL Compliant','Your data is protected under UAE Federal Law No. 45/2021 and DIFC DPL 2020.']].map(([icon,title,desc]) => (
                <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:'1rem', marginBottom:'1.5rem' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'rgba(58,123,255,0.1)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', fontWeight:700, marginBottom:'0.25rem' }}>{title}</div>
                    <p style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="signup-card" style={{ background:'var(--navy-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'2.5rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--accent),var(--sky),var(--teal))' }} />
              <div className="eyebrow" style={{ marginBottom:'1.25rem' }}>Career Alert Registration</div>
              {subDone ? (
                <div style={{ textAlign:'center', padding:'2rem 0' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
                  <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.8rem', marginBottom:'0.5rem' }}>You're on the list!</h3>
                  <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>We'll be in touch when a matching role opens.</p>
                </div>
              ) : (
                <form onSubmit={submitSub}>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">First Name <span className="req">*</span></label><input className="form-input" value={subForm.fname} onChange={e=>setSF('fname',e.target.value)} placeholder="Ahmed" /></div>
                    <div className="form-group"><label className="form-label">Last Name <span className="req">*</span></label><input className="form-input" value={subForm.lname} onChange={e=>setSF('lname',e.target.value)} placeholder="Al Mansouri" /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-input" type="email" value={subForm.email} onChange={e=>setSF('email',e.target.value)} placeholder="ahmed@company.ae" /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" value={subForm.phone} onChange={e=>setSF('phone',e.target.value)} placeholder="+971 50 000 0000" /></div>
                    <div className="form-group"><label className="form-label">Location <span className="req">*</span></label>
                      <select className="form-select" value={subForm.location} onChange={e=>setSF('location',e.target.value)}>
                        <option value="">Select…</option>
                        {['UAE – Dubai','UAE – Abu Dhabi','UAE – Other','Saudi Arabia','Qatar','Kuwait','India','United Kingdom','USA / Canada','Other'].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Area of Interest <span className="req">*</span></label>
                    <select className="form-select" value={subForm.interest} onChange={e=>setSF('interest',e.target.value)}>
                      <option value="">Select…</option>
                      {['AI/ML Engineering','AI Strategy & Consulting','Data Science & Analytics','MLOps & Infrastructure','AI Research (LLMs/NLP)','Enterprise AI Sales','Product Management','Operations & HR','Any / Open to All'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" type="url" value={subForm.linkedin} onChange={e=>setSF('linkedin',e.target.value)} placeholder="https://linkedin.com/in/yourname" /></div>
                  <div className="form-check">
                    <input type="checkbox" id="sub-consent" checked={subForm.consentGiven} onChange={e=>setSF('consentGiven',e.target.checked)} />
                    <label className="form-check-label" htmlFor="sub-consent">I consent to Solvagence storing my data for recruitment per <span style={{ color:'var(--accent)' }}>UAE PDPL</span> and <span style={{ color:'var(--accent)' }}>DIFC DPL 2020</span>. <span className="req">*</span></label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" checked={subForm.marketing} onChange={e=>setSF('marketing',e.target.checked)} /><label className="form-check-label">Receive Solvagence AI industry newsletter (optional)</label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }} disabled={subBusy}>
                    {subBusy ? <><span className="spinner"/> Registering…</> : 'Register My Interest'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'var(--navy-mid)', borderTop:'1px solid var(--border-s)', padding:'4rem 2rem 2rem' }}>
        <div className="inner">
          <div className="footer-grid">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontFamily:'Space Grotesk,sans-serif', fontWeight:700, marginBottom:'0.75rem' }}>
                <img src="/Solvagence-Logo.png" alt="Solvagence Logo" style={{ height: 32, width: 'auto' }} />
                SOLVAGENCE <span style={{ color:'var(--accent)' }}>CAREERS</span>
              </div>
              <p style={{ fontSize:'0.83rem', color:'var(--muted)', lineHeight:1.75, maxWidth:280 }}>{publicContent.footer.blurb}</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginTop:'1.25rem', fontFamily:'Space Grotesk,sans-serif', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', border:'1px solid var(--border-s)', padding:'0.4rem 0.9rem', borderRadius:100 }}>
                🏛️ {publicContent.footer.locationBadge}
              </div>
            </div>
            {[['Company',[['About Solvagence','https://solvagence.com'],['Our Services','https://solvagence.com/services'],['Investor Relations','https://solvagence.com/investor'],['Contact Us','https://solvagence.com/contact']]],['Careers',[['Open Roles','#open-roles'],['Benefits','#benefits'],['Hiring Process','#process'],['Career Alerts','#signup']]],['Legal & Connect',[['LinkedIn','https://linkedin.com/company/solvagence'],[company.careersEmail,`mailto:${company.careersEmail}`],['Admin Portal','/admin/login']]]].map(([title,links]) => (
              <div key={title}>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'1.25rem' }}>{title}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                  {links.map(([l,h]) => <a key={l} href={h} target={h.startsWith('http')?'_blank':undefined} style={{ fontSize:'0.83rem', color:'var(--muted)', transition:'var(--tr)' }} onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'2rem', borderTop:'1px solid var(--border-s)', fontSize:'0.78rem', color:'var(--muted)', flexWrap:'wrap', gap:'1rem' }}>
            <span>© 2025 Solvagence AI Consulting Limited. All rights reserved. DIFC Dubai, UAE.</span>
            <div className="footer-legal-links" style={{ display:'flex', gap:'1.5rem' }}>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('privacy')}>Privacy Policy</button>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('terms')}>Terms of Use</button>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('equal')}>Equal Opportunity</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Job Modal */}
      {selJob && <JobModal job={selJob} onClose={() => setSelJob(null)} />}

      {/* Legal Modals */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{{ privacy:'Privacy Policy', terms:'Terms of Use', equal:'Equal Opportunity Statement' }[modal]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.85 }}>
              {modal === 'privacy' && <>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Last updated:</strong> January 2025</p>
                <p style={{ marginBottom:'1rem' }}>Solvagence AI Consulting Limited is committed to protecting your data in accordance with <strong style={{ color:'var(--white)' }}>UAE Federal Decree-Law No. 45/2021 (PDPL)</strong> and the <strong style={{ color:'var(--white)' }}>DIFC Data Protection Law 2020</strong>.</p>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Data Collected:</strong> Name, email, phone, location, LinkedIn, resume, and career preferences submitted via this portal.</p>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Purpose:</strong> Recruitment assessment, career alerts, and talent pipeline management.</p>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Retention:</strong> Application data retained 24 months. Alert data retained until consent withdrawn.</p>
                <p><strong style={{ color:'var(--white)' }}>No Third-Party Selling:</strong> We never sell, rent, or trade your personal data. Contact: privacy@solvagence.com.</p>
              </>}
              {modal === 'terms' && <>
                <p style={{ marginBottom:'1rem' }}>By using careers.solvagence.com you agree to these Terms of Use.</p>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Acceptable Use:</strong> Legitimate job seekers and authorised admins only. Scraping and automated access prohibited.</p>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>Accuracy:</strong> You warrant all submitted information is truthful and accurate.</p>
                <p><strong style={{ color:'var(--white)' }}>Governing Law:</strong> DIFC Courts jurisdiction. Solvagence AI Consulting Limited, DIFC, Dubai, UAE.</p>
              </>}
              {modal === 'equal' && <>
                <p style={{ marginBottom:'1rem' }}>Solvagence AI Consulting Limited is an equal opportunity employer committed to an inclusive environment for all employees and candidates.</p>
                <p style={{ marginBottom:'1rem' }}>We do not discriminate on nationality, gender, age, disability, religion, or any characteristic protected by UAE Labour Law.</p>
                <p><strong style={{ color:'var(--white)' }}>Emiratisation:</strong> We are committed to the UAE Nafis Programme and actively develop UAE National talent at all levels. Accommodation requests: careers@solvagence.com.</p>
              </>}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
      `}</style>
    </div>
  )
}
