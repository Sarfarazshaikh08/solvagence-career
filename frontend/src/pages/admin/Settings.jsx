import { useEffect, useState } from 'react'
import { authAPI, settingsAPI } from '../../api'
import { toast } from '../../components/Toast'

export default function Settings() {
  const [pw, setPw] = useState({ current:'', next:'', confirm:'' })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    company: {
      name: 'Solvagence AI Consulting Limited',
      careersEmail: 'careers@solvagence.com',
      hqLocation: 'DIFC, Dubai, UAE',
      website: 'https://solvagence.com',
    },
    notifications: {
      newApplicationAlert: true,
      dailyDigest: true,
      newSubscriberAlert: false,
      weeklyAnalytics: true,
    },
  })

  useEffect(() => {
    settingsAPI.get()
      .then(r => {
        const data = r.data.data
        setSettings({
          company: {
            name: data.company?.name || '',
            careersEmail: data.company?.careersEmail || '',
            hqLocation: data.company?.hqLocation || '',
            website: data.company?.website || '',
          },
          notifications: {
            newApplicationAlert: !!data.notifications?.newApplicationAlert,
            dailyDigest: !!data.notifications?.dailyDigest,
            newSubscriberAlert: !!data.notifications?.newSubscriberAlert,
            weeklyAnalytics: !!data.notifications?.weeklyAnalytics,
          },
        })
      })
      .catch(e => toast.error(e.response?.data?.message || 'Could not load settings'))
      .finally(() => setLoading(false))
  }, [])

  const changePassword = async () => {
    if (!pw.current || !pw.next) { toast.error('All password fields required'); return }
    if (pw.next !== pw.confirm) { toast.error('New passwords do not match'); return }
    if (pw.next.length < 8)     { toast.error('Minimum 8 characters'); return }
    setBusy(true)
    try {
      await authAPI.changePassword({ currentPassword: pw.current, newPassword: pw.next })
      toast.success('Password updated')
      setPw({ current:'', next:'', confirm:'' })
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setBusy(false) }
  }

  const setCompany = (key, value) => {
    setSettings(prev => ({ ...prev, company: { ...prev.company, [key]: value } }))
  }

  const setNotification = (key, value) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const r = await settingsAPI.update(settings)
      const data = r.data.data
      setSettings({
        company: {
          name: data.company?.name || '',
          careersEmail: data.company?.careersEmail || '',
          hqLocation: data.company?.hqLocation || '',
          website: data.company?.website || '',
        },
        notifications: {
          newApplicationAlert: !!data.notifications?.newApplicationAlert,
          dailyDigest: !!data.notifications?.dailyDigest,
          newSubscriberAlert: !!data.notifications?.newSubscriberAlert,
          weeklyAnalytics: !!data.notifications?.weeklyAnalytics,
        },
      })
      toast.success('Settings updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const reloadSettings = async () => {
    const r = await settingsAPI.get()
    const data = r.data.data
    setSettings({
      company: {
        name: data.company?.name || '',
        careersEmail: data.company?.careersEmail || '',
        hqLocation: data.company?.hqLocation || '',
        website: data.company?.website || '',
      },
      notifications: {
        newApplicationAlert: !!data.notifications?.newApplicationAlert,
        dailyDigest: !!data.notifications?.dailyDigest,
        newSubscriberAlert: !!data.notifications?.newSubscriberAlert,
        weeklyAnalytics: !!data.notifications?.weeklyAnalytics,
      },
    })
  }

  const resetPortal = async () => {
    if (!confirm('This will permanently replace jobs, applications, subscribers, admin login, and settings with the default seeded data. Continue?')) return

    setResetting(true)
    try {
      await settingsAPI.reset()
      await reloadSettings()
      setPw({ current:'', next:'', confirm:'' })
      toast.success('Portal reset to seed defaults')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not reset portal')
    } finally {
      setResetting(false)
    }
  }

  const card  = { background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.75rem' }
  const ctitle = { fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', fontWeight:700, color:'var(--white)', marginBottom:'1.25rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border-s)' }
  const srow  = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 0', borderBottom:'1px solid var(--border-s)', gap:'1rem' }
  const slabel = { fontFamily:'Space Grotesk,sans-serif', fontSize:'0.82rem', fontWeight:600 }
  const sdesc  = { fontSize:'0.75rem', color:'var(--muted)', marginTop:'0.15rem' }

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner" /></div>
  }

  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'Crimson Text,serif', fontSize:'2rem' }}>Portal Settings</h2>
        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:'0.25rem' }}>Solvagence Careers Admin Configuration</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>

        <div style={card}>
          <div style={ctitle}>Company Information</div>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={settings.company.name} onChange={e => setCompany('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Careers Email</label>
            <input className="form-input" type="email" value={settings.company.careersEmail} onChange={e => setCompany('careersEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">HQ Location</label>
            <input className="form-input" value={settings.company.hqLocation} onChange={e => setCompany('hqLocation', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="form-input" value={settings.company.website} onChange={e => setCompany('website', e.target.value)} />
          </div>
          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save Company Info'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Change Password</div>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={pw.current} onChange={e=>setPw(p=>({...p,current:e.target.value}))} placeholder="Current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={pw.next} onChange={e=>setPw(p=>({...p,next:e.target.value}))} placeholder="Min 8 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={pw.confirm} onChange={e=>setPw(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password" />
          </div>
          <button className="btn-primary" onClick={changePassword} disabled={busy}>
            {busy ? <><span className="spinner"/> Updating…</> : 'Update Password'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Notifications</div>
          {[
            ['newApplicationAlert', 'New Application Alert', 'Email when a candidate applies'],
            ['dailyDigest', 'Daily Digest', 'Morning summary of all activity'],
            ['newSubscriberAlert', 'New Subscriber Alert', 'When someone registers for alerts'],
            ['weeklyAnalytics', 'Weekly Analytics Report', 'Automated weekly pipeline summary'],
          ].map(([key, l, d]) => (
            <div key={l} style={srow}>
              <div><div style={slabel}>{l}</div><div style={sdesc}>{d}</div></div>
              <label className="toggle">
                <input type="checkbox" checked={settings.notifications[key]} onChange={e => setNotification(key, e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
          ))}
          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save Notifications'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Data Management</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            <div style={srow}>
              <div><div style={slabel}>Application Export</div><div style={sdesc}>CSV export is available from the Candidates page.</div></div>
              <span style={{ fontSize:'0.75rem', color:'var(--teal)' }}>Live</span>
            </div>
            <div style={srow}>
              <div><div style={slabel}>Subscriber Export</div><div style={sdesc}>CSV export is available from the Subscribers page.</div></div>
              <span style={{ fontSize:'0.75rem', color:'var(--teal)' }}>Live</span>
            </div>
            <div style={{ ...srow, borderBottom:'none' }}>
              <div><div style={{ ...slabel, color:'#FF9090' }}>Factory Reset</div><div style={sdesc}>Restores the seeded admin account, jobs, applications, subscribers, and settings.</div></div>
              <button className="btn-danger" onClick={resetPortal} disabled={resetting}>
                {resetting ? <><span className="spinner"/> Resetting…</> : 'Reset'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
