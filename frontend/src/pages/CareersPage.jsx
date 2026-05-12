import { useState, useEffect, useRef } from 'react'
import { jobsAPI, appsAPI, subsAPI, settingsAPI } from '../api'
import ResumeUpload from '../components/ResumeUpload'
import { ToastProvider, toast } from '../components/Toast'

const LOCATION_OPTIONS = [
  { value:'UAE – Dubai', en:'UAE – Dubai', ar:'الإمارات - دبي' },
  { value:'UAE – Abu Dhabi', en:'UAE – Abu Dhabi', ar:'الإمارات - أبوظبي' },
  { value:'UAE – Other', en:'UAE – Other', ar:'الإمارات - أخرى' },
  { value:'Saudi Arabia', en:'Saudi Arabia', ar:'السعودية' },
  { value:'Qatar', en:'Qatar', ar:'قطر' },
  { value:'Kuwait', en:'Kuwait', ar:'الكويت' },
  { value:'Bahrain', en:'Bahrain', ar:'البحرين' },
  { value:'Oman', en:'Oman', ar:'عُمان' },
  { value:'Egypt', en:'Egypt', ar:'مصر' },
  { value:'India', en:'India', ar:'الهند' },
  { value:'United Kingdom', en:'United Kingdom', ar:'المملكة المتحدة' },
  { value:'USA / Canada', en:'USA / Canada', ar:'أمريكا / كندا' },
  { value:'Other', en:'Other', ar:'أخرى' },
]

const INTEREST_OPTIONS = [
  { value:'AI/ML Engineering', en:'AI/ML Engineering', ar:'هندسة الذكاء الاصطناعي وتعلم الآلة' },
  { value:'AI Strategy & Consulting', en:'AI Strategy & Consulting', ar:'استراتيجية واستشارات الذكاء الاصطناعي' },
  { value:'Data Science & Analytics', en:'Data Science & Analytics', ar:'علم البيانات والتحليلات' },
  { value:'MLOps & Infrastructure', en:'MLOps & Infrastructure', ar:'البنية التحتية وعمليات تعلم الآلة' },
  { value:'AI Research (LLMs/NLP)', en:'AI Research (LLMs/NLP)', ar:'أبحاث الذكاء الاصطناعي (النماذج اللغوية ومعالجة اللغة)' },
  { value:'Enterprise AI Sales', en:'Enterprise AI Sales', ar:'مبيعات حلول الذكاء الاصطناعي للمؤسسات' },
  { value:'Product Management', en:'Product Management', ar:'إدارة المنتجات' },
  { value:'Operations & HR', en:'Operations & HR', ar:'العمليات والموارد البشرية' },
  { value:'Any / Open to All', en:'Any / Open to All', ar:'أي مجال / مفتوح للجميع' },
]

const EXPERIENCE_OPTIONS = [
  { value:'0–2 years', en:'0–2 years', ar:'0-2 سنوات' },
  { value:'2–5 years', en:'2–5 years', ar:'2-5 سنوات' },
  { value:'5–8 years', en:'5–8 years', ar:'5-8 سنوات' },
  { value:'8–12 years', en:'8–12 years', ar:'8-12 سنة' },
  { value:'12+ years', en:'12+ years', ar:'12+ سنة' },
]

const DEPT_LABELS = {
  Engineering: { en:'Engineering', ar:'الهندسة' },
  Consulting: { en:'Consulting', ar:'الاستشارات' },
  Research: { en:'Research', ar:'البحث' },
  Sales: { en:'Sales', ar:'المبيعات' },
  Operations: { en:'Operations', ar:'العمليات' },
}

const TYPE_LABELS = {
  'Full-Time': { en:'Full-Time', ar:'دوام كامل' },
  'Part-Time': { en:'Part-Time', ar:'دوام جزئي' },
  Contract: { en:'Contract', ar:'عقد' },
}

const BADGE_LABELS = {
  HOT: { en:'🔥 HOT', ar:'🔥 عاجل' },
  NEW: { en:'✨ NEW', ar:'✨ جديد' },
  FEATURED: { en:'⭐ FEATURED', ar:'⭐ مميز' },
  REMOTE: { en:'🌍 REMOTE', ar:'🌍 عن بُعد' },
}

const ARABIC_CONTENT = {
  hero: {
    badgeText: 'نحن نوظف الآن · مركز دبي المالي العالمي والعمل عن بُعد',
    titleLine1: 'ابنِ مستقبل',
    titleLine2: 'الذكاء الاصطناعي',
    titleLine3: 'من قلب الخليج',
    subtitle: 'سولفاجنس لاستشارات الذكاء الاصطناعي هي من أبرز شركات التحول المؤسسي بالذكاء الاصطناعي في الخليج، ومقرها مركز دبي المالي العالمي وتعمل في أكثر من 12 دولة.',
    ctaPrimary: 'استعرض الوظائف المفتوحة',
    ctaSecondary: 'احصل على تنبيهات الوظائف',
    stats: [
      { value:'35+', label:'وظائف مفتوحة' },
      { value:'12+', label:'دول نعمل فيها' },
      { value:'92%', label:'رضا الفريق' },
      { value:'4×', label:'نمو سنوي' },
    ],
  },
  sections: {
    openRolesTitle: 'اعثر على دورك',
    openRolesDesc: 'من هندسة الذكاء الاصطناعي المتقدمة إلى الاستشارات التنفيذية، أعمال استثنائية لأشخاص استثنائيين.',
    whyTitle: 'حيث يلتقي التميز بالهدف',
    benefitsTitle: 'مكافآت تواكب التميز في كل مستوى',
    processTitle: 'عملية واضحة وسريعة ومحترمة',
    signupTitle: 'احصل على وصول مبكر للوظائف الجديدة',
  },
  whyJoinUs: [
    { icon:'🌍', title:'أثر عالمي ومكانة مرموقة', desc:'اعمل من قلب دبي وساهم في تشكيل تبني الذكاء الاصطناعي عبر المنطقة وخارجها.' },
    { icon:'💸', title:'رواتب قوية مع دخل معفى من الضريبة', desc:'حزمنا تنافسية ومقارنة بأفضل الشركات العالمية مع مزايا شاملة.' },
    { icon:'🚀', title:'نمو سريع وملكية حقيقية', desc:'كل عضو في الفريق يملك نطاقاً مؤثراً منذ اليوم الأول ويعمل مباشرة مع القيادة.' },
    { icon:'🤖', title:'عمل على أحدث تقنيات الذكاء الاصطناعي', desc:'نماذج لغوية كبيرة، حلول مخصصة، وتطبيقات مؤسسية حقيقية لعملاء كبار.' },
  ],
  benefits: [
    { icon:'💰', title:'راتب تنافسي ومكافآت', desc:'دخل بالدرهم الإماراتي معفى من الضريبة، ومكافآت سنوية وحوافز إضافية.' },
    { icon:'✈️', title:'تأشيرة وانتقال إلى الإمارات', desc:'رعاية كاملة للتأشيرة والسكن المؤقت ودعم الانضمام للقادمين من الخارج.' },
    { icon:'🏥', title:'تأمين صحي ممتاز', desc:'تغطية صحية متوافقة مع متطلبات دبي لك وللمعالين، تشمل الجوانب الأساسية.' },
    { icon:'📚', title:'ميزانية تعلم وتطوير', desc:'دعم للشهادات والفعاليات والدورات والكتب مع تمويل كامل من الشركة.' },
  ],
  hiringJourney: [
    { num:'01', title:'قدّم الآن', desc:'أرسل طلبك وسيرتك الذاتية خلال دقائق قليلة فقط.' },
    { num:'02', title:'مراجعة الفريق', desc:'نراجع طلبك عادة خلال 5 أيام عمل.' },
    { num:'03', title:'مكالمة أولية', desc:'لقاء قصير لفهم خبرتك وأهدافك المهنية.' },
    { num:'04', title:'مقابلة المدير', desc:'نقاش أعمق مع مديرك المحتمل حول الدور والمواءمة.' },
  ],
  footer: {
    blurb: 'تحول مؤسسي بالذكاء الاصطناعي من مقرنا في مركز دبي المالي العالمي، نبني مستقبل الذكاء الاصطناعي عبر الخليج والشرق الأوسط والهند والولايات المتحدة.',
    locationBadge: 'مركز دبي المالي العالمي، دبي، الإمارات',
  },
}

const PAGE_UI = {
  en: {
    langToggle: 'العربية',
    nav: ['Open Roles', 'Why Us', 'Benefits', 'Process', 'Alerts'],
    mobileAdmin: 'Admin Portal ↗',
    adminLink: 'Admin ↗',
    openPositionsEyebrow: 'Open Positions',
    whyEyebrow: 'Why Join Us',
    whyDesc: "We don't just offer jobs — we offer a mission.",
    benefitsEyebrow: 'Compensation & Benefits',
    benefitsDesc: 'Top-quartile packages benchmarked against the best global firms.',
    processEyebrow: 'Our Hiring Journey',
    processDesc: 'We respect your time. Most roles close in under 3 weeks from first application.',
    signupEyebrow: 'Stay in the Loop',
    signupDesc: "Many of our best roles are filled before they're publicly announced. Register and be first.",
    searchPlaceholder: 'Search roles, skills, keywords…',
    filters: { all:'All Roles', engineering:'Engineering', consulting:'Consulting', research:'Research', sales:'Sales', operations:'Operations' },
    jobMetaPosted: 'Posted',
    applyButton: 'Apply →',
    noRolesTitle: 'No roles found',
    noRolesDesc: 'Try adjusting your search or filter',
    alertsCardEyebrow: 'Career Alert Registration',
    alertsBullets: [
      ['📬', 'Priority Notifications', 'Matched roles delivered 1–2 weeks before public posting.'],
      ['🎯', 'Personalised Matching', 'We hand-match your profile — no spam, only what fits.'],
      ['🔒', 'PDPL & DIFC DPL Compliant', 'Your data is protected under UAE Federal Law No. 45/2021 and DIFC DPL 2020.'],
    ],
    subscriber: {
      successTitle: "You're on the list!",
      successDesc: "We'll be in touch when a matching role opens.",
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      interest: 'Area of Interest',
      linkedin: 'LinkedIn',
      select: 'Select…',
      consent: 'I consent to Solvagence storing my data for recruitment per UAE PDPL and DIFC DPL 2020.',
      marketing: 'Receive Solvagence AI industry newsletter (optional)',
      button: 'Register My Interest',
      busy: 'Registering…',
      fnamePlaceholder: 'Ahmed',
      lnamePlaceholder: 'Al Mansouri',
      emailPlaceholder: 'ahmed@company.ae',
      phonePlaceholder: '+971 50 000 0000',
      linkedinPlaceholder: 'https://linkedin.com/in/yourname',
    },
    footer: {
      company: 'Company',
      careers: 'Careers',
      legal: 'Legal & Connect',
      companyLinks: [['About Solvagence','https://solvagence.com'],['Our Services','https://solvagence.com/services'],['Investor Relations','https://solvagence.com/investor'],['Contact Us','https://solvagence.com/contact']],
      careersLinks: [['Open Roles','#open-roles'],['Benefits','#benefits'],['Hiring Process','#process'],['Career Alerts','#signup']],
      adminPortal: 'Admin Portal',
      copyright: '© 2025 Solvagence AI Consulting Limited. All rights reserved. DIFC Dubai, UAE.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      equal: 'Equal Opportunity',
    },
    legal: {
      titles: { privacy:'Privacy Policy', terms:'Terms of Use', equal:'Equal Opportunity Statement' },
      privacy: [
        ['Last updated:', 'January 2025'],
        'Solvagence AI Consulting Limited is committed to protecting your data in accordance with UAE Federal Decree-Law No. 45/2021 (PDPL) and the DIFC Data Protection Law 2020.',
        'Data Collected: Name, email, phone, location, LinkedIn, resume, and career preferences submitted via this portal.',
        'Purpose: Recruitment assessment, career alerts, and talent pipeline management.',
        'Retention: Application data retained 24 months. Alert data retained until consent withdrawn.',
        'No Third-Party Selling: We never sell, rent, or trade your personal data. Contact: privacy@solvagence.com.',
      ],
      terms: [
        'By using careers.solvagence.com you agree to these Terms of Use.',
        'Acceptable Use: Legitimate job seekers and authorised admins only. Scraping and automated access prohibited.',
        'Accuracy: You warrant all submitted information is truthful and accurate.',
        'Governing Law: DIFC Courts jurisdiction. Solvagence AI Consulting Limited, DIFC, Dubai, UAE.',
      ],
      equal: [
        'Solvagence AI Consulting Limited is an equal opportunity employer committed to an inclusive environment for all employees and candidates.',
        'We do not discriminate on nationality, gender, age, disability, religion, or any characteristic protected by UAE Labour Law.',
        'Emiratisation: We are committed to the UAE Nafis Programme and actively develop UAE National talent at all levels. Accommodation requests: careers@solvagence.com.',
      ],
    },
    modal: {
      tabs: { overview:'overview', requirements:'requirements', apply:'apply' },
      applyRole: 'Apply for This Role →',
      requirementsTitle: "What We're Looking For",
      successTitle: 'Application Received!',
      successDesc: "We'll review your profile within 5 business days. Good luck!",
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      experience: 'Years of Experience',
      linkedin: 'LinkedIn Profile',
      resume: 'Resume / CV',
      resumeMeta: '(PDF, DOC, DOCX · Max 10MB)',
      select: 'Select…',
      consent: 'I consent to Solvagence AI Consulting processing my data for recruitment under UAE PDPL and DIFC Data Protection Law 2020.',
      submit: '🚀 Submit Application',
      submitting: 'Submitting…',
      fnamePlaceholder: 'Ahmed',
      lnamePlaceholder: 'Al Mansouri',
      emailPlaceholder: 'you@company.ae',
      phonePlaceholder: '+971 50 000 0000',
      linkedinPlaceholder: 'https://linkedin.com/in/yourname',
      errors: {
        required: 'Please fill in all required fields',
        consent: 'PDPL consent is required',
        success: 'Application submitted!',
        failed: 'Submission failed',
      },
    },
    toasts: {
      subscriberRequired: 'Please fill all required fields',
      subscriberConsent: 'Recruitment consent is required',
      subscriberSuccess: 'Registered for alerts!',
      submitFailed: 'Submission failed',
      jobsLoad: 'Unable to load open roles right now.',
    },
  },
  ar: {
    langToggle: 'English',
    nav: ['الوظائف', 'لماذا نحن', 'المزايا', 'العملية', 'التنبيهات'],
    mobileAdmin: 'بوابة الإدارة ↗',
    adminLink: 'الإدارة ↗',
    openPositionsEyebrow: 'الوظائف المفتوحة',
    whyEyebrow: 'لماذا تنضم إلينا',
    whyDesc: 'نحن لا نقدم مجرد وظيفة، بل مهمة ذات أثر.',
    benefitsEyebrow: 'الرواتب والمزايا',
    benefitsDesc: 'حزم قوية مصممة لمنافسة أفضل الشركات العالمية.',
    processEyebrow: 'رحلة التوظيف لدينا',
    processDesc: 'نحترم وقتك، ومعظم الأدوار تُغلق خلال أقل من 3 أسابيع من التقديم الأول.',
    signupEyebrow: 'ابقَ على اطلاع',
    signupDesc: 'العديد من أفضل أدوارنا تُغلق قبل الإعلان العام. سجّل لتكون من الأوائل.',
    searchPlaceholder: 'ابحث عن وظائف أو مهارات أو كلمات مفتاحية…',
    filters: { all:'كل الوظائف', engineering:'الهندسة', consulting:'الاستشارات', research:'البحث', sales:'المبيعات', operations:'العمليات' },
    jobMetaPosted: 'نُشرت في',
    applyButton: 'قدّم الآن ←',
    noRolesTitle: 'لا توجد وظائف مطابقة',
    noRolesDesc: 'جرّب تعديل البحث أو الفلتر',
    alertsCardEyebrow: 'تسجيل تنبيهات الوظائف',
    alertsBullets: [
      ['📬', 'إشعارات مبكرة', 'نرسل لك الوظائف المناسبة قبل الإعلان العام بفترة.'],
      ['🎯', 'مطابقة مخصصة', 'نطابق ملفك مع الأدوار المناسبة بدون رسائل مزعجة.'],
      ['🔒', 'متوافق مع PDPL وDIFC DPL', 'بياناتك محمية وفق الأنظمة المعمول بها في الإمارات ومركز دبي المالي العالمي.'],
    ],
    subscriber: {
      successTitle: 'تم تسجيلك بنجاح!',
      successDesc: 'سنتواصل معك عند توفر دور مناسب.',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      location: 'الموقع',
      interest: 'مجال الاهتمام',
      linkedin: 'لينكدإن',
      select: 'اختر…',
      consent: 'أوافق على احتفاظ سولفاجنس ببياناتي لأغراض التوظيف وفق قوانين حماية البيانات ذات الصلة.',
      marketing: 'أرغب في تلقي النشرة الإخبارية الخاصة بسولفاجنس (اختياري)',
      button: 'سجّل اهتمامي',
      busy: 'جارٍ التسجيل…',
      fnamePlaceholder: 'أحمد',
      lnamePlaceholder: 'المنصوري',
      emailPlaceholder: 'ahmed@company.ae',
      phonePlaceholder: '+971 50 000 0000',
      linkedinPlaceholder: 'https://linkedin.com/in/yourname',
    },
    footer: {
      company: 'الشركة',
      careers: 'الوظائف',
      legal: 'القانوني والتواصل',
      companyLinks: [['عن سولفاجنس','https://solvagence.com'],['خدماتنا','https://solvagence.com/services'],['علاقات المستثمرين','https://solvagence.com/investor'],['تواصل معنا','https://solvagence.com/contact']],
      careersLinks: [['الوظائف المفتوحة','#open-roles'],['المزايا','#benefits'],['عملية التوظيف','#process'],['تنبيهات الوظائف','#signup']],
      adminPortal: 'بوابة الإدارة',
      copyright: '© 2025 سولفاجنس لاستشارات الذكاء الاصطناعي. جميع الحقوق محفوظة. دبي، الإمارات.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      equal: 'تكافؤ الفرص',
    },
    legal: {
      titles: { privacy:'سياسة الخصوصية', terms:'شروط الاستخدام', equal:'بيان تكافؤ الفرص' },
      privacy: [
        ['آخر تحديث:', 'يناير 2025'],
        'تلتزم سولفاجنس بحماية بياناتك وفقاً لقانون حماية البيانات الشخصية في دولة الإمارات وقانون حماية البيانات في مركز دبي المالي العالمي.',
        'البيانات التي نجمعها: الاسم والبريد الإلكتروني والهاتف والموقع ولينكدإن والسيرة الذاتية وتفضيلات المسار المهني.',
        'الغرض: تقييم طلبات التوظيف، وإرسال تنبيهات الوظائف، وإدارة قاعدة المواهب.',
        'الاحتفاظ: نحتفظ ببيانات التقديم لمدة 24 شهراً، وبيانات التنبيهات حتى سحب الموافقة.',
        'عدم بيع البيانات: نحن لا نبيع أو نؤجر أو نتاجر ببياناتك الشخصية. للتواصل: privacy@solvagence.com.',
      ],
      terms: [
        'باستخدامك careers.solvagence.com فإنك توافق على شروط الاستخدام هذه.',
        'الاستخدام المقبول: مخصص للباحثين عن عمل الشرعيين والمشرفين المخولين فقط. يُحظر السحب الآلي للبيانات.',
        'الدقة: أنت تضمن أن جميع المعلومات المقدمة صحيحة ودقيقة.',
        'القانون الحاكم: يخضع هذا الموقع لاختصاص محاكم مركز دبي المالي العالمي.',
      ],
      equal: [
        'تلتزم سولفاجنس بتوفير بيئة شاملة وعادلة لجميع الموظفين والمتقدمين.',
        'نحن لا نميز على أساس الجنسية أو الجنس أو العمر أو الإعاقة أو الدين أو أي سمة يحميها القانون.',
        'التوطين: نحن ملتزمون ببرنامج نافس وبتطوير الكفاءات الوطنية الإماراتية على جميع المستويات.',
      ],
    },
    modal: {
      tabs: { overview:'نظرة عامة', requirements:'المتطلبات', apply:'التقديم' },
      applyRole: 'قدّم لهذا الدور ←',
      requirementsTitle: 'ما الذي نبحث عنه',
      successTitle: 'تم استلام طلبك!',
      successDesc: 'سنراجع ملفك خلال 5 أيام عمل. بالتوفيق!',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      location: 'الموقع',
      experience: 'سنوات الخبرة',
      linkedin: 'ملف لينكدإن',
      resume: 'السيرة الذاتية',
      resumeMeta: '(PDF, DOC, DOCX · الحد الأقصى 10MB)',
      select: 'اختر…',
      consent: 'أوافق على معالجة سولفاجنس لبياناتي لأغراض التوظيف وفقاً لقوانين حماية البيانات ذات الصلة.',
      submit: '🚀 إرسال الطلب',
      submitting: 'جارٍ الإرسال…',
      fnamePlaceholder: 'أحمد',
      lnamePlaceholder: 'المنصوري',
      emailPlaceholder: 'you@company.ae',
      phonePlaceholder: '+971 50 000 0000',
      linkedinPlaceholder: 'https://linkedin.com/in/yourname',
      errors: {
        required: 'يرجى تعبئة جميع الحقول المطلوبة',
        consent: 'موافقة حماية البيانات مطلوبة',
        success: 'تم إرسال الطلب بنجاح!',
        failed: 'فشل إرسال الطلب',
      },
    },
    toasts: {
      subscriberRequired: 'يرجى تعبئة جميع الحقول المطلوبة',
      subscriberConsent: 'موافقة التوظيف مطلوبة',
      subscriberSuccess: 'تم التسجيل لتلقي التنبيهات!',
      submitFailed: 'فشل إرسال الطلب',
      jobsLoad: 'تعذر تحميل الوظائف المفتوحة حالياً.',
    },
  },
}

const labelFor = (labelMap, value, lang) => labelMap[value]?.[lang] || value
const optionLabel = (option, lang) => lang === 'ar' ? option.ar : option.en

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
const badgeMap = { HOT:'badge-hot', NEW:'badge-new-role', FEATURED:'badge-featured', REMOTE:'badge-remote' }

/* ── Job Apply Modal ─────────────────────────────────────────────── */
function JobModal({ job, onClose, lang }) {
  const ui = PAGE_UI[lang].modal
  const jobTitle = lang === 'ar' && job.titleAr ? job.titleAr : job.title
  const jobDesc = lang === 'ar' && job.descAr ? job.descAr : job.desc
  const jobRequirements = lang === 'ar' && Array.isArray(job.requirementsAr) && job.requirementsAr.length ? job.requirementsAr : (job.requirements || [])
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ fname:'',lname:'',email:'',phone:'',location:'',exp:'',linkedin:'' })
  const [resume, setResume] = useState(null)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!job) return null
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = async () => {
    if (!form.fname||!form.lname||!form.email||!form.location||!form.exp) { toast.error(ui.errors.required); return }
    if (!consent) { toast.error(ui.errors.consent); return }
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k,v))
      fd.append('jobId', job._id)
      fd.append('consent', 'true')
      if (resume) fd.append('resume', resume)
      await appsAPI.submit(fd)
      setDone(true)
      toast.success(ui.errors.success)
    } catch(e) { toast.error(e.response?.data?.message || ui.errors.failed) }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:640 }}>
        <div className="modal-head">
          <h3>{job.icon} {jobTitle}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-tabs">
          {['overview','requirements','apply'].map(t => (
            <div key={t} className={`modal-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{ui.tabs[t]}</div>
          ))}
        </div>
        <div className="modal-body">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>
                  <span style={{ color:'var(--accent-pale)', fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>{labelFor(DEPT_LABELS, job.dept, lang)} · {labelFor(TYPE_LABELS, job.type, lang)}</span> &nbsp;·&nbsp; 📍 {job.location}
                </div>
              </div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', lineHeight:1.85, marginBottom:'1.5rem' }}>{jobDesc}</p>
              <button className="btn-primary" onClick={() => setTab('apply')}>{ui.applyRole}</button>
            </div>
          )}
          {/* Requirements */}
          {tab === 'requirements' && (
            <div>
              <h4 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.88rem', marginBottom:'1rem' }}>{ui.requirementsTitle}</h4>
              <ul style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {jobRequirements.map((r,i) => (
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
                <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.8rem', marginBottom:'0.5rem' }}>{ui.successTitle}</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>{ui.successDesc}</p>
              </div>
            ) : (
              <div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">{ui.firstName} <span className="req">*</span></label><input className="form-input" value={form.fname} onChange={e=>set('fname',e.target.value)} placeholder={ui.fnamePlaceholder} /></div>
                  <div className="form-group"><label className="form-label">{ui.lastName} <span className="req">*</span></label><input className="form-input" value={form.lname} onChange={e=>set('lname',e.target.value)} placeholder={ui.lnamePlaceholder} /></div>
                </div>
                <div className="form-group"><label className="form-label">{ui.email} <span className="req">*</span></label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder={ui.emailPlaceholder} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">{ui.phone}</label><input className="form-input" type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder={ui.phonePlaceholder} /></div>
                  <div className="form-group"><label className="form-label">{ui.location} <span className="req">*</span></label>
                    <select className="form-select" value={form.location} onChange={e=>set('location',e.target.value)}>
                      <option value="">{ui.select}</option>
                      {LOCATION_OPTIONS.map(option => <option key={option.value} value={option.value}>{optionLabel(option, lang)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">{ui.experience} <span className="req">*</span></label>
                  <select className="form-select" value={form.exp} onChange={e=>set('exp',e.target.value)}>
                    <option value="">{ui.select}</option>
                    {EXPERIENCE_OPTIONS.map(option => <option key={option.value} value={option.value}>{optionLabel(option, lang)}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{ui.linkedin}</label><input className="form-input" type="url" value={form.linkedin} onChange={e=>set('linkedin',e.target.value)} placeholder={ui.linkedinPlaceholder} /></div>
                <div className="form-group">
                  <label className="form-label">{ui.resume} <span style={{ color:'var(--teal)', fontSize:'0.7rem' }}>{ui.resumeMeta}</span></label>
                  <ResumeUpload file={resume} onChange={setResume} />
                </div>
                <div className="form-check">
                  <input type="checkbox" id="modal-consent" checked={consent} onChange={e=>setConsent(e.target.checked)} />
                  <label className="form-check-label" htmlFor="modal-consent">
                    {ui.consent} <span className="req">*</span>
                  </label>
                </div>
                <button className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }} onClick={submit} disabled={busy}>
                  {busy ? <><span className="spinner"/> {ui.submitting}</> : ui.submit}
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
  const [lang, setLang] = useState(() => localStorage.getItem('careers-lang') || 'en')
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
  const [publicContentAr, setPublicContentAr] = useState(ARABIC_CONTENT)
  const isArabic = lang === 'ar'
  const ui = PAGE_UI[lang]
  const displayContent = isArabic ? publicContentAr : publicContent

  const heroStats = (displayContent.hero.stats || []).map((item, index) =>
    index === 0
      ? { ...item, value: `${jobs.length}` }
      : item
  )

  const setSF = (k,v) => setSubForm(p=>({...p,[k]:v}))

  useEffect(() => {
    localStorage.setItem('careers-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
  }, [isArabic, lang])

  useEffect(() => {
    setJobsError('')
    jobsAPI.getPublic({ category: filter !== 'all' ? filter : undefined, q: q||undefined })
      .then(r => setJobs(r.data.data))
      .catch((e) => {
        setJobs([])
        setJobsError(e?.response?.data?.message || ui.toasts.jobsLoad)
      })
  }, [filter, q, ui.toasts.jobsLoad])

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
          if (d?.publicContentAr) {
            setPublicContentAr(prev => ({
              ...prev,
              ...d.publicContentAr,
              hero: { ...prev.hero, ...(d.publicContentAr.hero || {}) },
              sections: { ...prev.sections, ...(d.publicContentAr.sections || {}) },
              footer: { ...prev.footer, ...(d.publicContentAr.footer || {}) },
              whyJoinUs: Array.isArray(d.publicContentAr.whyJoinUs) && d.publicContentAr.whyJoinUs.length ? d.publicContentAr.whyJoinUs : prev.whyJoinUs,
              benefits: Array.isArray(d.publicContentAr.benefits) && d.publicContentAr.benefits.length ? d.publicContentAr.benefits : prev.benefits,
              hiringJourney: Array.isArray(d.publicContentAr.hiringJourney) && d.publicContentAr.hiringJourney.length ? d.publicContentAr.hiringJourney : prev.hiringJourney,
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
    if (!subForm.fname||!subForm.lname||!subForm.email||!subForm.location||!subForm.interest) { toast.error(ui.toasts.subscriberRequired); return }
    if (!subForm.consentGiven) { toast.error(ui.toasts.subscriberConsent); return }
    setSubBusy(true)
    try { await subsAPI.subscribe(subForm); setSubDone(true); toast.success(ui.toasts.subscriberSuccess) }
    catch(e) { toast.error(e.response?.data?.message || ui.toasts.submitFailed) }
    finally { setSubBusy(false) }
  }

  const s = {
    header: { position:'fixed', top:0, left:0, right:0, zIndex:900, height:72, display:'flex', alignItems:'center', padding:'0 2rem', background:'rgba(7,9,26,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border-s)' },
    hInner: { maxWidth:1200, width:'100%', margin:'0 auto', display:'flex', alignItems:'center', gap:'2rem' },
    logo:   { display:'flex', alignItems:'center', gap:'0.75rem', fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'1.05rem', flexShrink:0, cursor:'pointer' },
    lm:     { width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--sky))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'0.85rem' },
    card:   { background:'var(--navy-card)', border:'1px solid var(--border-s)', borderRadius:'var(--r-lg)', padding:'1.75rem', transition:'var(--tr)', cursor:'pointer' },
  }

  const filters = [['all',ui.filters.all],['engineering',ui.filters.engineering],['consulting',ui.filters.consulting],['research',ui.filters.research],['sales',ui.filters.sales],['operations',ui.filters.operations]]

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className={isArabic ? 'lang-ar' : 'lang-en'}>
      <ToastProvider />

      {/* Header */}
      <header style={s.header}>
        <div className="careers-header-inner" style={s.hInner}>
          <div style={s.logo} onClick={() => { setMenuOpen(false); window.scrollTo({top:0,behavior:'smooth'}) }}>
            <img src="/Solvagence-Logo.png" alt="Solvagence Logo" style={{ height: 36, width: 'auto' }} />
            <span>SOLVAGENCE <span style={{ color:'var(--accent)' }}>CAREERS</span></span>
          </div>
          <nav className="careers-nav" style={{ display:'flex', gap:'0.25rem', marginLeft:'auto' }}>
            {['#open-roles','#why','#benefits','#process','#signup'].map((h, index) => (
              <a key={h} href={h} style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.82rem', fontWeight:600, color:'var(--muted)', padding:'0.45rem 0.9rem', borderRadius:6, transition:'var(--tr)' }}
                onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--muted)'} onClick={() => setMenuOpen(false)}>{ui.nav[index]}</a>
            ))}
          </nav>
          <button onClick={() => setLang(current => current === 'en' ? 'ar' : 'en')} style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.78rem', fontWeight:700, color:'var(--offwhite)', padding:'0.45rem 1rem', borderRadius:6, border:'1px solid var(--border-s)', transition:'var(--tr)', background:'rgba(255,255,255,0.03)' }}>
            {ui.langToggle}
          </button>
          <a className="careers-admin-link" href="/admin/login" style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.78rem', fontWeight:700, color:'var(--accent)', padding:'0.45rem 1.1rem', borderRadius:6, border:'1px solid var(--border)', transition:'var(--tr)' }}>{ui.adminLink}</a>
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
            {['#open-roles','#why','#benefits','#process','#signup'].map((h, index) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)}>{ui.nav[index]}</a>
            ))}
            <button onClick={() => setLang(current => current === 'en' ? 'ar' : 'en')} style={{ display:'block', width:'100%', textAlign:isArabic ? 'right' : 'left', fontFamily:'Space Grotesk,sans-serif', fontSize:'0.86rem', fontWeight:700, color:'var(--offwhite)', padding:'0.8rem 0.9rem', borderRadius:10, background:'none' }}>
              {ui.langToggle}
            </button>
            <a href="/admin/login" onClick={() => setMenuOpen(false)}>{ui.mobileAdmin}</a>
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
            {displayContent.hero.badgeText}
          </div>
          <h1 style={{ fontSize:'clamp(2.6rem,5.5vw,4.8rem)', fontWeight:700, marginBottom:'1.5rem', lineHeight:1.08, maxWidth:700 }}>
            {displayContent.hero.titleLine1}
            <br/>{displayContent.hero.titleLine2}<br/>{displayContent.hero.titleLine3}
          </h1>
          <p style={{ fontSize:'1.1rem', color:'var(--muted)', marginBottom:'2.5rem', maxWidth:520, lineHeight:1.75 }}>
            {displayContent.hero.subtitle}
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'3rem' }}>
            <a href="#open-roles" className="btn-primary">🔍 {displayContent.hero.ctaPrimary}</a>
            <a href="#signup" className="btn-secondary">{displayContent.hero.ctaSecondary}</a>
          </div>
          <div className="hero-stats" style={{ display:'flex', gap:'2.5rem', flexWrap:'wrap', paddingTop:'2.5rem', borderTop:'1px solid var(--border-s)' }}>
            {heroStats.map((item, idx) => (
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
            <div className="eyebrow">{ui.openPositionsEyebrow}</div>
            <h2 className="section-title">{displayContent.sections.openRolesTitle}</h2>
            <p className="section-desc">{displayContent.sections.openRolesDesc}</p>
            <div className="divider" />
          </div>
          <input className="form-input" style={{ marginBottom:'1rem', maxWidth:500 }} placeholder={ui.searchPlaceholder} value={q} onChange={e=>setQ(e.target.value)} />
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
                  {j.badge && <span className={`badge ${badgeMap[j.badge]||''}`}>{BADGE_LABELS[j.badge]?.[lang] || j.badge}</span>}
                </div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'0.35rem' }}>{lang === 'ar' && j.titleAr ? j.titleAr : j.title}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--accent-pale)', marginBottom:'1rem' }}>{labelFor(DEPT_LABELS, j.dept, lang)}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', marginBottom:'1.25rem' }}>
                  {[['📍',j.location],['💼',labelFor(TYPE_LABELS, j.type, lang)],['📅',`${ui.jobMetaPosted} ${new Date(j.createdAt).toLocaleDateString()}`]].map(([ic,txt]) => (
                    <div key={txt} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', color:'var(--muted)' }}><span>{ic}</span>{txt}</div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'1rem', borderTop:'1px solid var(--border-s)' }}>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.8rem', color:'var(--muted)' }}>{labelFor(TYPE_LABELS, j.type, lang)}</span>
                  <button className="btn-primary" style={{ fontSize:'0.75rem', padding:'0.5rem 1rem' }}>{ui.applyButton}</button>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'4rem 2rem', color:'var(--muted)' }}>
                <h3 style={{ color:'var(--white)', fontFamily:'Space Grotesk,sans-serif', marginBottom:'0.5rem' }}>{ui.noRolesTitle}</h3>
                <p>{ui.noRolesDesc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Solvagence */}
      <section id="why" className="section">
        <div className="inner">
          <div className="section-head c">
            <div className="eyebrow">{ui.whyEyebrow}</div>
            <h2 className="section-title">{displayContent.sections.whyTitle}</h2>
            <p className="section-desc">{ui.whyDesc}</p>
            <div className="divider c" />
          </div>
          <div className="feature-grid">
            {(displayContent.whyJoinUs || []).map(({ icon, title, desc }) => (
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
            <div className="eyebrow">{ui.benefitsEyebrow}</div>
            <h2 className="section-title">{displayContent.sections.benefitsTitle}</h2>
            <p className="section-desc">{ui.benefitsDesc}</p>
            <div className="divider" />
          </div>
          <div className="benefits-grid">
            {(displayContent.benefits || []).map(({ icon, title, desc }) => (
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
            <div className="eyebrow">{ui.processEyebrow}</div>
            <h2 className="section-title">{displayContent.sections.processTitle}</h2>
            <p className="section-desc">{ui.processDesc}</p>
            <div className="divider c" />
          </div>
          <div className="process-grid">
            {(displayContent.hiringJourney || []).map(({ num, title, desc }) => (
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
                <div className="eyebrow">{ui.signupEyebrow}</div>
                <h2 className="section-title">{displayContent.sections.signupTitle}</h2>
                <p className="section-desc">{ui.signupDesc}</p>
                <div className="divider" />
              </div>
              {ui.alertsBullets.map(([icon,title,desc]) => (
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
              <div className="eyebrow" style={{ marginBottom:'1.25rem' }}>{ui.alertsCardEyebrow}</div>
              {subDone ? (
                <div style={{ textAlign:'center', padding:'2rem 0' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
                  <h3 style={{ fontFamily:'Crimson Text,serif', fontSize:'1.8rem', marginBottom:'0.5rem' }}>{ui.subscriber.successTitle}</h3>
                  <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{ui.subscriber.successDesc}</p>
                </div>
              ) : (
                <form onSubmit={submitSub}>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">{ui.subscriber.firstName} <span className="req">*</span></label><input className="form-input" value={subForm.fname} onChange={e=>setSF('fname',e.target.value)} placeholder={ui.subscriber.fnamePlaceholder} /></div>
                    <div className="form-group"><label className="form-label">{ui.subscriber.lastName} <span className="req">*</span></label><input className="form-input" value={subForm.lname} onChange={e=>setSF('lname',e.target.value)} placeholder={ui.subscriber.lnamePlaceholder} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">{ui.subscriber.email} <span className="req">*</span></label><input className="form-input" type="email" value={subForm.email} onChange={e=>setSF('email',e.target.value)} placeholder={ui.subscriber.emailPlaceholder} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">{ui.subscriber.phone}</label><input className="form-input" type="tel" value={subForm.phone} onChange={e=>setSF('phone',e.target.value)} placeholder={ui.subscriber.phonePlaceholder} /></div>
                    <div className="form-group"><label className="form-label">{ui.subscriber.location} <span className="req">*</span></label>
                      <select className="form-select" value={subForm.location} onChange={e=>setSF('location',e.target.value)}>
                        <option value="">{ui.subscriber.select}</option>
                        {LOCATION_OPTIONS.filter(option => option.value !== 'Bahrain' && option.value !== 'Oman' && option.value !== 'Egypt').map(option => <option key={option.value} value={option.value}>{optionLabel(option, lang)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">{ui.subscriber.interest} <span className="req">*</span></label>
                    <select className="form-select" value={subForm.interest} onChange={e=>setSF('interest',e.target.value)}>
                      <option value="">{ui.subscriber.select}</option>
                      {INTEREST_OPTIONS.map(option => <option key={option.value} value={option.value}>{optionLabel(option, lang)}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">{ui.subscriber.linkedin}</label><input className="form-input" type="url" value={subForm.linkedin} onChange={e=>setSF('linkedin',e.target.value)} placeholder={ui.subscriber.linkedinPlaceholder} /></div>
                  <div className="form-check">
                    <input type="checkbox" id="sub-consent" checked={subForm.consentGiven} onChange={e=>setSF('consentGiven',e.target.checked)} />
                    <label className="form-check-label" htmlFor="sub-consent">{ui.subscriber.consent} <span className="req">*</span></label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" checked={subForm.marketing} onChange={e=>setSF('marketing',e.target.checked)} /><label className="form-check-label">{ui.subscriber.marketing}</label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }} disabled={subBusy}>
                    {subBusy ? <><span className="spinner"/> {ui.subscriber.busy}</> : ui.subscriber.button}
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
              <p style={{ fontSize:'0.83rem', color:'var(--muted)', lineHeight:1.75, maxWidth:280 }}>{displayContent.footer.blurb}</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginTop:'1.25rem', fontFamily:'Space Grotesk,sans-serif', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', border:'1px solid var(--border-s)', padding:'0.4rem 0.9rem', borderRadius:100 }}>
                🏛️ {displayContent.footer.locationBadge}
              </div>
            </div>
            {[
              [ui.footer.company, ui.footer.companyLinks],
              [ui.footer.careers, ui.footer.careersLinks],
              [ui.footer.legal, [['LinkedIn','https://linkedin.com/company/solvagence'], [company.careersEmail,`mailto:${company.careersEmail}`], [ui.footer.adminPortal,'/admin/login']]],
            ].map(([title,links]) => (
              <div key={title}>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'1.25rem' }}>{title}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                  {links.map(([l,h]) => <a key={l} href={h} target={h.startsWith('http')?'_blank':undefined} style={{ fontSize:'0.83rem', color:'var(--muted)', transition:'var(--tr)' }} onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'2rem', borderTop:'1px solid var(--border-s)', fontSize:'0.78rem', color:'var(--muted)', flexWrap:'wrap', gap:'1rem' }}>
            <span>{ui.footer.copyright}</span>
            <div className="footer-legal-links" style={{ display:'flex', gap:'1.5rem' }}>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('privacy')}>{ui.footer.privacy}</button>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('terms')}>{ui.footer.terms}</button>
              <button style={{ color:'var(--muted)', fontSize:'0.78rem', background:'none', border:'none', cursor:'pointer' }} onClick={() => setModal('equal')}>{ui.footer.equal}</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Job Modal */}
      {selJob && <JobModal job={selJob} onClose={() => setSelJob(null)} lang={lang} />}

      {/* Legal Modals */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{ui.legal.titles[modal]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.85 }}>
              {modal === 'privacy' && <>
                <p style={{ marginBottom:'1rem' }}><strong style={{ color:'var(--white)' }}>{ui.legal.privacy[0][0]}</strong> {ui.legal.privacy[0][1]}</p>
                {ui.legal.privacy.slice(1).map((line, index) => <p key={index} style={{ marginBottom:index === ui.legal.privacy.length - 2 ? 0 : '1rem' }}>{line}</p>)}
              </>}
              {modal === 'terms' && <>
                {ui.legal.terms.map((line, index) => <p key={index} style={{ marginBottom:index === ui.legal.terms.length - 1 ? 0 : '1rem' }}>{line}</p>)}
              </>}
              {modal === 'equal' && <>
                {ui.legal.equal.map((line, index) => <p key={index} style={{ marginBottom:index === ui.legal.equal.length - 1 ? 0 : '1rem' }}>{line}</p>)}
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
