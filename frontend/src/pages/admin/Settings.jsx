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

const DEFAULT_PUBLIC_CONTENT_AR = {
  hero: {
    badgeText: 'نحن نوظف الآن · مركز دبي المالي العالمي والعمل عن بُعد',
    titleLine1: 'ابنِ مستقبل',
    titleLine2: 'الذكاء الاصطناعي',
    titleLine3: 'من قلب الخليج',
    subtitle: 'سولفاجنس لاستشارات الذكاء الاصطناعي من أبرز شركات التحول المؤسسي في المنطقة، ومقرها دبي وتعمل عبر أكثر من 12 دولة.',
    ctaPrimary: 'استعرض الوظائف المفتوحة',
    ctaSecondary: 'احصل على تنبيهات الوظائف',
    stats: [
      { value: '35+', label: 'وظائف مفتوحة' },
      { value: '12+', label: 'دول نعمل فيها' },
      { value: '92%', label: 'رضا الفريق' },
      { value: '4×', label: 'نمو سنوي' },
    ],
  },
  sections: {
    openRolesTitle: 'اعثر على دورك',
    openRolesDesc: 'من هندسة الذكاء الاصطناعي المتقدمة إلى الاستشارات التنفيذية، أعمال مميزة لأشخاص مميزين.',
    whyTitle: 'حيث يلتقي التميز بالهدف',
    benefitsTitle: 'مزايا تكافئ التميز',
    processTitle: 'عملية واضحة وسريعة ومحترمة',
    signupTitle: 'احصل على وصول مبكر للوظائف الجديدة',
  },
  whyJoinUs: [
    { icon:'🌍', title:'أثر عالمي ومكانة مرموقة', desc:'اعمل من قلب دبي وساهم في تشكيل تبني الذكاء الاصطناعي عبر المنطقة وخارجها.' },
    { icon:'💸', title:'رواتب قوية مع دخل معفى من الضريبة', desc:'حزم تنافسية ومزايا شاملة مقارنة بأفضل الشركات العالمية.' },
    { icon:'🚀', title:'نمو سريع وملكية حقيقية', desc:'كل عضو في الفريق يملك نطاقاً مؤثراً منذ اليوم الأول.' },
    { icon:'🤖', title:'عمل على أحدث تقنيات الذكاء الاصطناعي', desc:'نماذج لغوية كبيرة وحلول مخصصة لعملاء مؤسسيين كبار.' },
  ],
  benefits: [
    { icon:'💰', title:'راتب تنافسي ومكافآت', desc:'دخل بالدرهم معفى من الضريبة مع مكافآت سنوية وحوافز إضافية.' },
    { icon:'✈️', title:'تأشيرة وانتقال إلى الإمارات', desc:'رعاية كاملة للتأشيرة والسكن المؤقت ودعم الانضمام.' },
    { icon:'🏥', title:'تأمين صحي ممتاز', desc:'تغطية صحية شاملة لك وللمعالين.' },
    { icon:'📚', title:'ميزانية تعلم وتطوير', desc:'تمويل للشهادات والفعاليات والدورات والكتب.' },
  ],
  hiringJourney: [
    { num:'01', title:'قدّم الآن', desc:'أرسل طلبك وسيرتك الذاتية خلال دقائق قليلة.' },
    { num:'02', title:'مراجعة الفريق', desc:'نراجع طلبك عادة خلال 5 أيام عمل.' },
    { num:'03', title:'مكالمة أولية', desc:'مكالمة قصيرة لفهم خبرتك وأهدافك المهنية.' },
    { num:'04', title:'مقابلة المدير', desc:'نقاش أعمق مع مديرك المحتمل حول الدور والمواءمة.' },
  ],
  footer: {
    blurb: 'تحول مؤسسي بالذكاء الاصطناعي من مقرنا في دبي، نبني مستقبل الذكاء الاصطناعي عبر الخليج والشرق الأوسط والهند والولايات المتحدة.',
    locationBadge: 'دبي، الإمارات',
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
  publicContentAr: {
    hero: {
      badgeText: data.publicContentAr?.hero?.badgeText || DEFAULT_PUBLIC_CONTENT_AR.hero.badgeText,
      titleLine1: data.publicContentAr?.hero?.titleLine1 || DEFAULT_PUBLIC_CONTENT_AR.hero.titleLine1,
      titleLine2: data.publicContentAr?.hero?.titleLine2 || DEFAULT_PUBLIC_CONTENT_AR.hero.titleLine2,
      titleLine3: data.publicContentAr?.hero?.titleLine3 || DEFAULT_PUBLIC_CONTENT_AR.hero.titleLine3,
      subtitle: data.publicContentAr?.hero?.subtitle || DEFAULT_PUBLIC_CONTENT_AR.hero.subtitle,
      ctaPrimary: data.publicContentAr?.hero?.ctaPrimary || DEFAULT_PUBLIC_CONTENT_AR.hero.ctaPrimary,
      ctaSecondary: data.publicContentAr?.hero?.ctaSecondary || DEFAULT_PUBLIC_CONTENT_AR.hero.ctaSecondary,
      stats: Array.isArray(data.publicContentAr?.hero?.stats) && data.publicContentAr.hero.stats.length === 4
        ? data.publicContentAr.hero.stats.map((s, i) => ({ value: s?.value || DEFAULT_PUBLIC_CONTENT_AR.hero.stats[i].value, label: s?.label || DEFAULT_PUBLIC_CONTENT_AR.hero.stats[i].label }))
        : DEFAULT_PUBLIC_CONTENT_AR.hero.stats,
    },
    sections: {
      openRolesTitle: data.publicContentAr?.sections?.openRolesTitle || DEFAULT_PUBLIC_CONTENT_AR.sections.openRolesTitle,
      openRolesDesc: data.publicContentAr?.sections?.openRolesDesc || DEFAULT_PUBLIC_CONTENT_AR.sections.openRolesDesc,
      whyTitle: data.publicContentAr?.sections?.whyTitle || DEFAULT_PUBLIC_CONTENT_AR.sections.whyTitle,
      benefitsTitle: data.publicContentAr?.sections?.benefitsTitle || DEFAULT_PUBLIC_CONTENT_AR.sections.benefitsTitle,
      processTitle: data.publicContentAr?.sections?.processTitle || DEFAULT_PUBLIC_CONTENT_AR.sections.processTitle,
      signupTitle: data.publicContentAr?.sections?.signupTitle || DEFAULT_PUBLIC_CONTENT_AR.sections.signupTitle,
    },
    whyJoinUs: Array.isArray(data.publicContentAr?.whyJoinUs) && data.publicContentAr.whyJoinUs.length
      ? data.publicContentAr.whyJoinUs.map((item, i) => ({
          icon: item?.icon || DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs.length].icon,
          title: item?.title || DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs[i % DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT_AR.whyJoinUs,
    benefits: Array.isArray(data.publicContentAr?.benefits) && data.publicContentAr.benefits.length
      ? data.publicContentAr.benefits.map((item, i) => ({
          icon: item?.icon || DEFAULT_PUBLIC_CONTENT_AR.benefits[i % DEFAULT_PUBLIC_CONTENT_AR.benefits.length].icon,
          title: item?.title || DEFAULT_PUBLIC_CONTENT_AR.benefits[i % DEFAULT_PUBLIC_CONTENT_AR.benefits.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT_AR.benefits[i % DEFAULT_PUBLIC_CONTENT_AR.benefits.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT_AR.benefits,
    hiringJourney: Array.isArray(data.publicContentAr?.hiringJourney) && data.publicContentAr.hiringJourney.length
      ? data.publicContentAr.hiringJourney.map((item, i) => ({
          num: item?.num || DEFAULT_PUBLIC_CONTENT_AR.hiringJourney[i % DEFAULT_PUBLIC_CONTENT_AR.hiringJourney.length].num,
          title: item?.title || DEFAULT_PUBLIC_CONTENT_AR.hiringJourney[i % DEFAULT_PUBLIC_CONTENT_AR.hiringJourney.length].title,
          desc: item?.desc || DEFAULT_PUBLIC_CONTENT_AR.hiringJourney[i % DEFAULT_PUBLIC_CONTENT_AR.hiringJourney.length].desc,
        }))
      : DEFAULT_PUBLIC_CONTENT_AR.hiringJourney,
    footer: {
      blurb: data.publicContentAr?.footer?.blurb || DEFAULT_PUBLIC_CONTENT_AR.footer.blurb,
      locationBadge: data.publicContentAr?.footer?.locationBadge || DEFAULT_PUBLIC_CONTENT_AR.footer.locationBadge,
    },
  },
})

export default function Settings() {
  const [pw, setPw] = useState({ current:'', next:'', confirm:'' })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contentLang, setContentLang] = useState('en')
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
    publicContentAr: DEFAULT_PUBLIC_CONTENT_AR,
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

  const contentKey = contentLang === 'ar' ? 'publicContentAr' : 'publicContent'
  const activePublicContent = settings[contentKey]

  const setHero = (key, value) => {
    setSettings(prev => ({ ...prev, [contentKey]: { ...prev[contentKey], hero: { ...prev[contentKey].hero, [key]: value } } }))
  }

  const setHeroStat = (idx, key, value) => {
    setSettings(prev => {
      const stats = [...prev[contentKey].hero.stats]
      stats[idx] = { ...stats[idx], [key]: value }
      return { ...prev, [contentKey]: { ...prev[contentKey], hero: { ...prev[contentKey].hero, stats } } }
    })
  }

  const setSection = (key, value) => {
    setSettings(prev => ({ ...prev, [contentKey]: { ...prev[contentKey], sections: { ...prev[contentKey].sections, [key]: value } } }))
  }

  const setFooter = (key, value) => {
    setSettings(prev => ({ ...prev, [contentKey]: { ...prev[contentKey], footer: { ...prev[contentKey].footer, [key]: value } } }))
  }

  const setListItem = (listKey, idx, key, value) => {
    setSettings(prev => {
      const list = [...prev[contentKey][listKey]]
      list[idx] = { ...list[idx], [key]: value }
      return { ...prev, [contentKey]: { ...prev[contentKey], [listKey]: list } }
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
          <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1rem' }}>
            <button className={contentLang === 'en' ? 'btn-primary' : 'btn-ghost'} onClick={() => setContentLang('en')} type="button">English</button>
            <button className={contentLang === 'ar' ? 'btn-primary' : 'btn-ghost'} onClick={() => setContentLang('ar')} type="button">Arabic</button>
          </div>
          <div className="form-group">
            <label className="form-label">Badge Text</label>
            <input className="form-input" value={activePublicContent.hero.badgeText} onChange={e => setHero('badgeText', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Title Line 1</label><input className="form-input" value={activePublicContent.hero.titleLine1} onChange={e => setHero('titleLine1', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Title Line 2</label><input className="form-input" value={activePublicContent.hero.titleLine2} onChange={e => setHero('titleLine2', e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Title Line 3</label>
            <input className="form-input" value={activePublicContent.hero.titleLine3} onChange={e => setHero('titleLine3', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subtitle</label>
            <textarea className="form-textarea" rows="3" value={activePublicContent.hero.subtitle} onChange={e => setHero('subtitle', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Primary CTA</label><input className="form-input" value={activePublicContent.hero.ctaPrimary} onChange={e => setHero('ctaPrimary', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Secondary CTA</label><input className="form-input" value={activePublicContent.hero.ctaSecondary} onChange={e => setHero('ctaSecondary', e.target.value)} /></div>
          </div>
          {activePublicContent.hero.stats.map((item, idx) => (
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
          <div style={ctitle}>Public Page Preview ({contentLang === 'en' ? 'English' : 'Arabic'})</div>
          <div style={{ background:'var(--navy-mid)', border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'1.25rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', border:'1px solid var(--border)', borderRadius:100, padding:'0.35rem 0.75rem', fontSize:'0.68rem', color:'var(--accent-pale)', marginBottom:'0.9rem' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
              {activePublicContent.hero.badgeText}
            </div>
            <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.7rem', lineHeight:1.15, marginBottom:'0.6rem' }}>
              {activePublicContent.hero.titleLine1}<br />
              {activePublicContent.hero.titleLine2}<br />
              {activePublicContent.hero.titleLine3}
            </h3>
            <p style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.65, marginBottom:'1rem' }}>
              {activePublicContent.hero.subtitle}
            </p>
            <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginBottom:'1rem' }}>
              <span className="btn-primary" style={{ pointerEvents:'none' }}>🔍 {activePublicContent.hero.ctaPrimary}</span>
              <span className="btn-secondary" style={{ pointerEvents:'none' }}>{activePublicContent.hero.ctaSecondary}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'0.75rem' }}>
              {activePublicContent.hero.stats.map((item, idx) => (
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
          <div className="form-group"><label className="form-label">Open Roles Title</label><input className="form-input" value={activePublicContent.sections.openRolesTitle} onChange={e => setSection('openRolesTitle', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Open Roles Description</label><textarea className="form-textarea" rows="2" value={activePublicContent.sections.openRolesDesc} onChange={e => setSection('openRolesDesc', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Why Us Title</label><input className="form-input" value={activePublicContent.sections.whyTitle} onChange={e => setSection('whyTitle', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Benefits Title</label><input className="form-input" value={activePublicContent.sections.benefitsTitle} onChange={e => setSection('benefitsTitle', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Process Title</label><input className="form-input" value={activePublicContent.sections.processTitle} onChange={e => setSection('processTitle', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Signup Title</label><input className="form-input" value={activePublicContent.sections.signupTitle} onChange={e => setSection('signupTitle', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Footer Blurb</label><textarea className="form-textarea" rows="3" value={activePublicContent.footer.blurb} onChange={e => setFooter('blurb', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Footer Location Badge</label><input className="form-input" value={activePublicContent.footer.locationBadge} onChange={e => setFooter('locationBadge', e.target.value)} /></div>
          <button className="btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner"/> Saving…</> : 'Save Public Content'}
          </button>
        </div>

        <div style={card}>
          <div style={ctitle}>Public Blocks: Why, Benefits, Journey</div>
          <div className="form-group"><label className="form-label">Why Join Us Cards</label></div>
          {activePublicContent.whyJoinUs.map((item, idx) => (
            <div key={`why-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.9rem', marginBottom:'0.75rem' }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={item.icon} onChange={e => setListItem('whyJoinUs', idx, 'icon', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={item.title} onChange={e => setListItem('whyJoinUs', idx, 'title', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={item.desc} onChange={e => setListItem('whyJoinUs', idx, 'desc', e.target.value)} /></div>
            </div>
          ))}

          <div className="form-group"><label className="form-label">Compensation & Benefits Cards</label></div>
          {activePublicContent.benefits.map((item, idx) => (
            <div key={`benefit-${idx}`} style={{ border:'1px solid var(--border-s)', borderRadius:'var(--r)', padding:'0.9rem', marginBottom:'0.75rem' }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={item.icon} onChange={e => setListItem('benefits', idx, 'icon', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={item.title} onChange={e => setListItem('benefits', idx, 'title', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={item.desc} onChange={e => setListItem('benefits', idx, 'desc', e.target.value)} /></div>
            </div>
          ))}

          <div className="form-group"><label className="form-label">Our Hiring Journey Steps</label></div>
          {activePublicContent.hiringJourney.map((item, idx) => (
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
