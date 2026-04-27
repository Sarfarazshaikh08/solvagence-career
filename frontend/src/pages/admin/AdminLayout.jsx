import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ToastProvider } from '../../components/Toast'
import { useEffect, useState } from 'react'

const NAV = [
  { to:'dashboard',   icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label:'Dashboard' },
  { to:'candidates',  icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, label:'Candidates' },
  { to:'subscribers', icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:'Subscribers' },
  { to:'jobs',        icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>, label:'Job Postings' },
  { to:'analytics',  icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label:'Analytics' },
  { to:'settings',   icon:<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, label:'Settings' },
]

const s = {
  app:     { display:'flex', minHeight:'100vh' },
  sidebar: (open) => ({
    width:240, flexShrink:0, background:'var(--navy-card)',
    borderRight:'1px solid var(--border-s)',
    display:'flex', flexDirection:'column',
    position:'fixed', left:0, top:0, bottom:0, zIndex:800,
    transition:'transform 0.3s ease',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    overflowY:'auto',
  }),
  shead:  { padding:'1.5rem 1.25rem', borderBottom:'1px solid var(--border-s)' },
  logo:   { display:'flex', alignItems:'center', gap:'0.75rem', fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'0.95rem' },
  lmark:  { width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--sky))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.85rem', color:'#fff' },
  lspan:  { color:'var(--accent)' },
  nav:    { flex:1, padding:'1rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.25rem' },
  label:  { fontFamily:'Space Grotesk,sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', padding:'0.75rem 0.75rem 0.3rem' },
  foot:   { padding:'1rem 0.75rem', borderBottom:'1px solid var(--border-s)' },
  main:   { flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', transition:'margin-left 0.3s ease' },
  topbar: { height:64, background:'var(--navy-card)', borderBottom:'1px solid var(--border-s)', display:'flex', alignItems:'center', padding:'0 2rem', gap:'1rem', position:'sticky', top:0, zIndex:100 },
  content:{ flex:1, padding:'2rem', background:'var(--navy)' },
  item:   (active) => ({
    display:'flex', alignItems:'center', gap:'0.75rem',
    padding:'0.65rem 0.85rem', borderRadius:'var(--r)',
    fontFamily:'Space Grotesk,sans-serif', fontSize:'0.82rem', fontWeight:600,
    color: active ? 'var(--accent)' : 'var(--muted)',
    background: active ? 'rgba(58,123,255,0.1)' : 'transparent',
    cursor:'pointer', transition:'var(--tr)', textDecoration:'none',
    border:'none', width:'100%', textAlign:'left',
  }),
}

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 900 : true)

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 900
      setIsDesktop(desktop)
      setSideOpen(desktop)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div style={s.app} className="admin-shell">
      <ToastProvider />

      {/* Mobile overlay */}
      {!isDesktop && sideOpen && (
        <div onClick={() => setSideOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(7,9,26,0.7)', zIndex:799, backdropFilter:'blur(4px)' }} />
      )}

      <aside className="admin-sidebar" style={s.sidebar(sideOpen)}>
        <div style={s.shead}>
          <div style={s.logo}>
            <img src="/Solvagence-Logo.png" alt="Solvagence Logo" style={{ height: 32, width: 'auto' }} />
            <span>SOLVAGENCE <span style={s.lspan}>CAREERS</span></span>
          </div>
        </div>
        <nav style={s.nav}>
          <div style={s.label}>Overview</div>
          {NAV.slice(0,1).map(n => (
            <NavLink key={n.to} to={`/admin/${n.to}`} style={({ isActive }) => s.item(isActive)} onClick={() => setSideOpen(false)}>
              <span style={{ width:16, height:16, display:'flex' }}>{n.icon}</span>{n.label}
            </NavLink>
          ))}
          <div style={s.label}>Talent</div>
          {NAV.slice(1,3).map(n => (
            <NavLink key={n.to} to={`/admin/${n.to}`} style={({ isActive }) => s.item(isActive)} onClick={() => setSideOpen(false)}>
              <span style={{ width:16, height:16, display:'flex' }}>{n.icon}</span>{n.label}
            </NavLink>
          ))}
          <div style={s.label}>Jobs</div>
          {NAV.slice(3,4).map(n => (
            <NavLink key={n.to} to={`/admin/${n.to}`} style={({ isActive }) => s.item(isActive)} onClick={() => setSideOpen(false)}>
              <span style={{ width:16, height:16, display:'flex' }}>{n.icon}</span>{n.label}
            </NavLink>
          ))}
          <div style={s.label}>Reports</div>
          {NAV.slice(4,5).map(n => (
            <NavLink key={n.to} to={`/admin/${n.to}`} style={({ isActive }) => s.item(isActive)} onClick={() => setSideOpen(false)}>
              <span style={{ width:16, height:16, display:'flex' }}>{n.icon}</span>{n.label}
            </NavLink>
          ))}
          <div style={s.label}>Config</div>
          {NAV.slice(5).map(n => (
            <NavLink key={n.to} to={`/admin/${n.to}`} style={({ isActive }) => s.item(isActive)} onClick={() => setSideOpen(false)}>
              <span style={{ width:16, height:16, display:'flex' }}>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>
        <div style={s.foot}>
          <button style={s.item(false)} onClick={handleLogout}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-main" style={{ ...s.main, marginLeft: isDesktop && sideOpen ? 240 : 0 }}>
        <div className="admin-topbar" style={s.topbar}>
          <button onClick={() => setSideOpen(o => !o)}
            style={{ color:'var(--muted)', display:'flex', alignItems:'center' }}>
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="admin-topbar-title" style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.95rem', fontWeight:700, flex:1 }}>
            SOLVAGENCE CAREERS ADMIN
          </span>
          <div className="admin-topbar-actions">
            <a href="/" target="_blank" className="btn-ghost">← Public Site</a>
            <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.75rem', color:'var(--muted)' }}>
              {admin?.displayName || admin?.username}
            </span>
          </div>
        </div>
        <div className="admin-content" style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
