import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await login(form.username, form.password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const s = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--navy)', padding:'2rem', position:'relative', overflow:'hidden' },
    glow: { position:'absolute', top:'-20%', left:'-10%', width:700, height:700, background:'radial-gradient(ellipse,rgba(58,123,255,0.08) 0%,transparent 70%)', pointerEvents:'none' },
    box:  { background:'var(--navy-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'3rem', width:'100%', maxWidth:440, position:'relative', overflow:'hidden' },
    top:  { position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--accent),var(--sky))' },
    logo: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' },
    lm:   { width:38, height:38, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--sky))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff' },
    err:  { background:'rgba(224,79,79,0.12)', border:'1px solid rgba(224,79,79,0.3)', borderRadius:'var(--r)', padding:'0.75rem 1rem', fontSize:'0.83rem', color:'#FF8A8A', marginBottom:'1rem' },
    foot: { textAlign:'center', fontSize:'0.75rem', color:'var(--muted)', marginTop:'1.5rem' },
  }

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.box}>
        <div style={s.top} />
        <div style={s.logo}>
          <img src="/Solvagence-Logo.png" alt="Solvagence Logo" style={{ height: 38, width: 'auto' }} />
          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>Solvagence <span style={{ color:'var(--accent)' }}>Admin</span></span>
        </div>
        <h2 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.8rem', marginBottom:'0.3rem' }}>Portal Access</h2>
        <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:'2rem' }}>Solvagence Careers Admin · Authorised Personnel Only</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" value={form.username} autoComplete="username"
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} autoComplete="current-password"
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : 'Sign In to Admin'}
          </button>
        </form>

        <div style={s.foot}>
          <a href="/" style={{ color:'var(--accent)' }}>← Return to Careers Site</a>
        </div>
      </div>
    </div>
  )
}
