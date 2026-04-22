import { useEffect, useState } from 'react'
import { authAPI, settingsAPI } from '../../api'
import { toast } from '../../components/Toast'

const DEFAULT_PUBLIC_CONTENT = {
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
    { icon:'🌍', title:'Global Impact, DIFC Prestige', desc:"Work from the heart of Dubai's premier financial district while shaping AI adoption across 12+ countries." },
    { icon:'💸', title:'Tax-Free, Top-Tier Pay', desc:'Benchmarked against top firms. UAE offers 0% income tax.' },
    { icon:'🚀', title:'Hypergrowth & Ownership', desc:'4× YoY growth. Every team member owns meaningful scope from day one.' },
    { icon:'🤖', title:'Frontier AI Work', desc:"Build enterprise AI systems for the GCC's largest institutions." },
  ],
  benefits: [
    { icon:'💰', title:'Competitive Salary + Bonus', desc:'Tax-free AED income with annual bonus and spot awards.' },
    { icon:'✈️', title:'UAE Visa & Relocation', desc:'Full sponsorship, Emirates ID, one-way airfare, and temporary housing.' },
    { icon:'🏥', title:'Premium Health Insurance', desc:'Comprehensive medical coverage for you and dependents.' },
    { icon:'📚', title:'AED 15,000 Learning Budget', desc:'Certifications, conferences, and courses fully sponsored.' },
  ],
  hiringJourney: [
    { num:'01', title:'Apply Online', desc:'Submit your application with your CV in under 10 minutes.' },
    { num:'02', title:'Talent Review', desc:'Our team reviews within 5 business days.' },
    { num:'03', title:'Intro Call', desc:'30-minute video call to understand your profile.' },
    { num:'04', title:'HM Interview', desc:'Deep dive interview with your future manager.' },
  ],
  footer: {
    blurb: 'Enterprise AI transformation, headquartered in DIFC Dubai. Building the AI future across GCC, Middle East, India, and USA.',
    locationBadge: 'DIFC, Dubai, UAE',
  },
}

const normalizeSettings = (data = {}) => ({
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
  publicContent: {
    hero: {
      badgeText: data.publicContent?.hero?.badgeText || DEFAULT_PUBLIC_CONTENT.hero.badgeText,
      titleLine1: data.publicContent?.hero?.titleLine1 || DEFAULT_PUBLIC_CONTENT.hero.titleLine1,
      titleLine2: data.publicContent?.hero?.titleLine2 || DEFAULT_PUBLIC_CONTENT.hero.titleLine2,
      titleLine3: data.publicContent?.hero?.titleLine3 || DEFAULT_PUBLIC_CONTENT.hero.titleLine3,
      subtitle: data.publicContent?.hero?.subtitle || DEFAULT_PUBLIC_CONTENT.hero.subtitle,
      ctaPrimary: data.publicContent?.hero?.ctaPrimary || DEFAULT_PUBLIC_CONTENT.hero.ctaPrimary,
      ctaSecondary: data.publicContent?.hero?.ctaSecondary || DEFAULT_PUBLIC_CONTENT.hero.ctaSecondary,
      stats: Array.isArray(data.publicContent?.hero?.stats) && data.publicContent.hero.stats.length === 4
        ? data.publicContent.hero.stats.map((s, i) => ({ value: s?.value || DEFAULT_PUBLIC_CONTENT.hero.stats[i].value, label: s?.label || DEFAULT_PUBLIC_CONTENT.hero.stats[i].label }))
        : DEFAULT_PUBLIC_CONTENT.hero.stats,
    },
    sections: {
      openRolesTitle: data.publicContent?.sections?.openRolesTitle || DEFAULT_PUBLIC_CONTENT.sections.openRolesTitle,
      openRolesDesc: data.publicContent?.sections?.openRolesDesc || DEFAULT_PUBLIC_CONTENT.sections.openRolesDesc,
      whyTitle: data.publicContent?.sections?.whyTitle || DEFAULT_PUBLIC_CONTENT.sections.whyTitle,
      benefitsTitle: data.publicContent?.sections?.benefitsTitle || DEFAULT_PUBLIC_CONTENT.sections.benefitsTitle,
      processTitle: data.publicContent?.sections?.processTitle || DEFAULT_PUBLIC_CONTENT.sections.processTitle,
      signupTitle: data.publicContent?.sections?.signupTitle || DEFAULT_PUBLIC_CONTENT.sections.signupTitle,
    },
    whyJoinUs: Array.isArray(data.publicContent?.whyJoinUs) && data.publicContent.whyJoinUs.length
      ? data.publicContent.whyJoinUs.map((item, i) => ({
          icon: item?.icon || DEFAULT_PUBLIC_CONTENT.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT.whyJoinUs.length].icon,
          title: item?.title || DEFAULT_PUBLIC_CONTENT.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT.whyJoinUs.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT.whyJoinUs.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT.whyJoinUs,
    benefits: Array.isArray(data.publicContent?.benefits) && data.publicContent.benefits.length
      ? data.publicContent.benefits.map((item, i) => ({
          icon: item?.icon || DEFAULT_PUBLIC_CONTENT.benefits[i % DEFAULT_PUBLIC_CONTENT.benefits.length].icon,
          title: item?.title || DEFAULT_PUBLIC_CONTENT.benefits[i % DEFAULT_PUBLIC_CONTENT.benefits.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT.benefits[i % DEFAULT_PUBLIC_CONTENT.benefits.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT.benefits,
    hiringJourney: Array.isArray(data.publicContent?.hiringJourney) && data.publicContent.hiringJourney.length
      ? data.publicContent.hiringJourney.map((item, i) => ({
          num: item?.num || DEFAULT_PUBLIC_CONTENT.hiringJourney[i % DEFAULT_PUBLIC_CONTENT.hiringJourney.length].num,
          title: item?.title || DEFAULT_PUBLIC_CONTENT.hiringJourney[i % DEFAULT_PUBLIC_CONTENT.hiringJourney.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT.hiringJourney[i % DEFAULT_PUBLIC_CONTENT.hiringJourney.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT.hiringJourney,
    footer: {
      blurb: data.publicContent?.footer?.blurb || DEFAULT_PUBLIC_CONTENT.footer.blurb,
      locationBadge: data.publicContent?.footer?.locationBadge || DEFAULT_PUBLIC_CONTENT.footer.locationBadge,
    },
  },
})

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
    publicContent: DEFAULT_PUBLIC_CONTENT,
  })

  useEffect(() => {
    settingsAPI.get()
      .then(r => {
        setSettings(normalizeSettings(r.data.data))
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

  const setHero = (key, value) => {
    setSettings(prev => ({ ...prev, publicContent: { ...prev.publicContent, hero: { ...prev.publicContent.hero, [key]: value } } }))
  }

  const setHeroStat = (idx, key, value) => {
    setSettings(prev => {
      const stats = [...prev.publicContent.hero.stats]
      stats[idx] = { ...stats[idx], [key]: value }
      return { ...prev, publicContent: { ...prev.publicContent, hero: { ...prev.publicContent.hero, stats } } }
    })
  }

  const setSection = (key, value) => {
    setSettings(prev => ({ ...prev, publicContent: { ...prev.publicContent, sections: { ...prev.publicContent.sections, [key]: value } } }))
  }

  const setFooter = (key, value) => {
    setSettings(prev => ({ ...prev, publicContent: { ...prev.publicContent, footer: { ...prev.publicContent.footer, [key]: value } } }))
  }

  const setListItem = (listKey, idx, key, value) => {
    setSettings(prev => {
      const list = [...prev.publicContent[listKey]]
      list[idx] = { ...list[idx], [key]: value }
      return { ...prev, publicContent: { ...prev.publicContent, [listKey]: list } }
    })
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const r = await settingsAPI.update(settings)
      setSettings(normalizeSettings(r.data.data))
      toast.success('Settings updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const reloadSettings = async () => {
    const r = await settingsAPI.get()
    setSettings(normalizeSettings(r.data.data))
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
          <div style={ctitle}>Public Hero Content</div>
          <div className="form-group">
            <label className="form-label">Badge Text</label>
            <input className="form-input" value={settings.publicContent.hero.badgeText} onChange={e => setHero('badgeText', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Title Line 1</label><input className="form-input" value={settings.publicContent.hero.titleLine1} onChange={e => setHero('titleLine1', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Title Line 2</label><input className="form-input" value={settings.publicContent.hero.titleLine2} onChange={e => setHero('titleLine2', e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Title Line 3</label>
            <input className="form-input" value={settings.publicContent.hero.titleLine3} onChange={e => setHero('titleLine3', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subtitle</label>
            <textarea className="form-textarea" rows="3" value={settings.publicContent.hero.subtitle} onChange={e => setHero('subtitle', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Primary CTA</label><input className="form-input" value={settings.publicContent.hero.ctaPrimary} onChange={e => setHero('ctaPrimary', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Secondary CTA</label><input className="form-input" value={settings.publicContent.hero.ctaSecondary} onChange={e => setHero('ctaSecondary', e.target.value)} /></div>
          </div>
          {settings.publicContent.hero.stats.map((item, idx) => (
            <div key={idx} className="form-row">
              <div className="form-group"><label className="form-label">Stat {idx + 1} Value</label><input className="form-input" value={item.value} onChange={e => setHeroStat(idx, 'value', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Stat {idx + 1} Label</label><input className="form-input" value={item.label} onChange={e => setHeroStat(idx, 'label', e.target.value)} /></div>
            </div>
          ))}
          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save Hero Content'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Public Page Preview</div>
          <div style={{ background:'var(--navy-mid)', border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'1.25rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', border:'1px solid var(--border)', borderRadius:100, padding:'0.35rem 0.75rem', fontSize:'0.68rem', color:'var(--accent-pale)', marginBottom:'0.9rem' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
              {settings.publicContent.hero.badgeText}
            </div>
            <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.7rem', lineHeight:1.15, marginBottom:'0.6rem' }}>
              {settings.publicContent.hero.titleLine1}<br />
              {settings.publicContent.hero.titleLine2}<br />
              {settings.publicContent.hero.titleLine3}
            </h3>
            <p style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.65, marginBottom:'1rem' }}>
              {settings.publicContent.hero.subtitle}
            </p>
            <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginBottom:'1rem' }}>
              <span className="btn-primary" style={{ pointerEvents:'none' }}>🔍 {settings.publicContent.hero.ctaPrimary}</span>
              <span className="btn-secondary" style={{ pointerEvents:'none' }}>{settings.publicContent.hero.ctaSecondary}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'0.75rem' }}>
              {settings.publicContent.hero.stats.map((item, idx) => (
                <div key={`${item.label}-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.75rem' }}>
                  <div style={{ fontFamily:'Crimson Text,serif', fontSize:'1.4rem', fontWeight:700, lineHeight:1 }}>{item.value}</div>
                  <div style={{ fontSize:'0.74rem', color:'var(--muted)', marginTop:'0.25rem' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:'0.74rem', color:'var(--muted)', marginTop:'0.75rem' }}>
            Preview updates instantly from the form above. Save to publish on the public careers page.
          </p>
        </div>

        <div style={card}>
          <div style={ctitle}>Public Section Titles & Footer</div>
          <div className="form-group"><label className="form-label">Open Roles Title</label><input className="form-input" value={settings.publicContent.sections.openRolesTitle} onChange={e => setSection('openRolesTitle', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Open Roles Description</label><textarea className="form-textarea" rows="2" value={settings.publicContent.sections.openRolesDesc} onChange={e => setSection('openRolesDesc', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Why Us Title</label><input className="form-input" value={settings.publicContent.sections.whyTitle} onChange={e => setSection('whyTitle', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Benefits Title</label><input className="form-input" value={settings.publicContent.sections.benefitsTitle} onChange={e => setSection('benefitsTitle', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Process Title</label><input className="form-input" value={settings.publicContent.sections.processTitle} onChange={e => setSection('processTitle', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Signup Title</label><input className="form-input" value={settings.publicContent.sections.signupTitle} onChange={e => setSection('signupTitle', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Footer Blurb</label><textarea className="form-textarea" rows="3" value={settings.publicContent.footer.blurb} onChange={e => setFooter('blurb', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Footer Location Badge</label><input className="form-input" value={settings.publicContent.footer.locationBadge} onChange={e => setFooter('locationBadge', e.target.value)} /></div>
          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save Public Content'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Public Blocks: Why, Benefits, Journey</div>
          <div className="form-group"><label className="form-label">Why Join Us Cards</label></div>
          {settings.publicContent.whyJoinUs.map((item, idx) => (
            <div key={`why-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.9rem', marginBottom:'0.75rem' }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={item.icon} onChange={e => setListItem('whyJoinUs', idx, 'icon', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={item.title} onChange={e => setListItem('whyJoinUs', idx, 'title', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={item.desc} onChange={e => setListItem('whyJoinUs', idx, 'desc', e.target.value)} /></div>
            </div>
          ))}

          <div className="form-group"><label className="form-label">Compensation & Benefits Cards</label></div>
          {settings.publicContent.benefits.map((item, idx) => (
            <div key={`benefit-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.9rem', marginBottom:'0.75rem' }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={item.icon} onChange={e => setListItem('benefits', idx, 'icon', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={item.title} onChange={e => setListItem('benefits', idx, 'title', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={item.desc} onChange={e => setListItem('benefits', idx, 'desc', e.target.value)} /></div>
            </div>
          ))}

          <div className="form-group"><label className="form-label">Our Hiring Journey Steps</label></div>
          {settings.publicContent.hiringJourney.map((item, idx) => (
            <div key={`journey-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.9rem', marginBottom:'0.75rem' }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Step No.</label><input className="form-input" value={item.num} onChange={e => setListItem('hiringJourney', idx, 'num', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={item.title} onChange={e => setListItem('hiringJourney', idx, 'title', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={item.desc} onChange={e => setListItem('hiringJourney', idx, 'desc', e.target.value)} /></div>
            </div>
          ))}

          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save All Public Blocks'}
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
