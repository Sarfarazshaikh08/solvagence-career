const Job = require('../models/Job');
const Admin = require('../models/Admin');
const Application = require('../models/Application');
const Subscriber = require('../models/Subscriber');
const Setting = require('../models/Setting');

const JOBS = [
  { title:'Lead AI/ML Engineer', titleAr:'قائد هندسة الذكاء الاصطناعي وتعلم الآلة', dept:'Engineering', category:'engineering', location:'Dubai, UAE', type:'Full-Time', salMin:350000, salMax:550000, badge:'HOT', icon:'🤖', active:true,
    desc:'We are seeking an exceptional Lead AI/ML Engineer to drive the technical architecture and delivery of enterprise AI systems for Solvagence\'s most strategic sovereign and institutional clients.',
    descAr:'نبحث عن قائد متميز في هندسة الذكاء الاصطناعي وتعلم الآلة لقيادة البنية التقنية وتسليم الحلول المؤسسية لعملائنا الاستراتيجيين.',
    requirements:['8+ years ML/AI engineering experience','Deep expertise in Python, PyTorch or TensorFlow','Production LLM experience (fine-tuning, RAG, deployment)','MLOps pipelines (MLflow, Kubeflow)','Azure ML / AWS SageMaker / GCP Vertex AI','Client-facing experience preferred'],
    requirementsAr:['8+ سنوات خبرة في هندسة الذكاء الاصطناعي وتعلم الآلة','خبرة عميقة في Python وPyTorch أو TensorFlow','خبرة إنتاجية في النماذج اللغوية الكبيرة','خبرة في خطوط MLOps','خبرة في منصات Azure ML أو AWS أو GCP','يفضل الخبرة مع العملاء'] },
  { title:'Senior Data Scientist', titleAr:'عالم بيانات أول', dept:'Engineering', category:'engineering', location:'Dubai, UAE', type:'Full-Time', salMin:280000, salMax:380000, badge:'NEW', icon:'📊', active:true,
    desc:'Join our growing data science practice and work on high-impact predictive modelling, NLP, and analytics projects for GCC enterprise clients.',
    descAr:'انضم إلى فريق علم البيانات المتنامي لدينا واعمل على مشاريع نمذجة تنبؤية ومعالجة لغة طبيعية وتحليلات عالية الأثر.',
    requirements:['5+ years data science experience','Expert Python (pandas, scikit-learn)','NLP/LLM-based solutions','Strong statistical modelling','SQL and data pipeline experience'],
    requirementsAr:['5+ سنوات خبرة في علم البيانات','إتقان Python وأدواتها التحليلية','خبرة في حلول NLP وLLM','قدرات قوية في النمذجة الإحصائية','خبرة في SQL وخطوط البيانات'] },
  { title:'AI Strategy Consultant', titleAr:'استشاري استراتيجية الذكاء الاصطناعي', dept:'Consulting', category:'consulting', location:'Dubai, UAE', type:'Full-Time', salMin:320000, salMax:480000, badge:'FEATURED', icon:'🎯', active:true,
    desc:'Shape the AI transformation agenda for tier-1 clients — sovereign wealth funds, government entities, and major GCC banks.',
    descAr:'قد أجندة التحول بالذكاء الاصطناعي لعملاء من الصف الأول مثل الصناديق السيادية والجهات الحكومية والبنوك الكبرى.',
    requirements:['6+ years strategy consulting (Big 4, MBB)','AI/digital transformation delivery','Arabic language (advantage)','Track record advising C-suite','GCC regional experience'],
    requirementsAr:['6+ سنوات في الاستشارات الاستراتيجية','خبرة في التحول الرقمي والذكاء الاصطناعي','اللغة العربية ميزة إضافية','خبرة في تقديم المشورة للإدارة العليا','خبرة في منطقة الخليج'] },
  { title:'Full-Stack AI Engineer', titleAr:'مهندس ذكاء اصطناعي متكامل', dept:'Engineering', category:'engineering', location:'Dubai, UAE', type:'Full-Time', salMin:220000, salMax:320000, badge:'NEW', icon:'⚙️', active:true,
    desc:'Build AI-powered web applications and APIs that bring Solvagence\'s solutions to life for enterprise clients.',
    descAr:'طوّر تطبيقات ويب وواجهات برمجية مدعومة بالذكاء الاصطناعي لتحويل حلول سولفاجنس إلى منتجات عملية للعملاء.',
    requirements:['4+ years full-stack development','React or Next.js','Python backend (FastAPI, Django)','LLM API integration experience','Cloud deployment (Azure/AWS/GCP)'],
    requirementsAr:['4+ سنوات في التطوير المتكامل','خبرة في React أو Next.js','خبرة في باك-إند Python','دمج واجهات برمجة LLM','نشر سحابي على Azure أو AWS أو GCP'] },
  { title:'Enterprise AI Sales Director', titleAr:'مدير مبيعات الذكاء الاصطناعي للمؤسسات', dept:'Sales', category:'sales', location:'Dubai, UAE', type:'Full-Time', salMin:400000, salMax:600000, badge:'HOT', icon:'💼', active:true,
    desc:'Drive Solvagence\'s revenue growth by building and closing strategic relationships with sovereign wealth funds, government entities, and Tier 1 banks.',
    descAr:'قد نمو الإيرادات عبر بناء وإغلاق علاقات استراتيجية مع الصناديق السيادية والجهات الحكومية والبنوك الكبرى.',
    requirements:['8+ years enterprise technology sales','Proven AED 5M+ annual quota attainment','Established GCC network','C-suite relationship management','Arabic language advantage'],
    requirementsAr:['8+ سنوات في مبيعات التقنية للمؤسسات','سجل مثبت في تحقيق أهداف مبيعات عالية','شبكة قوية في الخليج','إدارة علاقات مع القيادات العليا','اللغة العربية ميزة'] },
  { title:'MLOps Engineer', titleAr:'مهندس عمليات تعلم الآلة', dept:'Engineering', category:'engineering', location:'Dubai, UAE', type:'Full-Time', salMin:200000, salMax:300000, badge:'NEW', icon:'🔧', active:true,
    desc:'Own the infrastructure, tooling, and processes that power Solvagence\'s AI model lifecycle — from development through to production monitoring.',
    descAr:'قد البنية التحتية والأدوات والعمليات التي تدعم دورة حياة نماذج الذكاء الاصطناعي من التطوير حتى المراقبة الإنتاجية.',
    requirements:['4+ years MLOps experience','Kubernetes, Docker','CI/CD (GitHub Actions, Azure DevOps)','MLflow, Kubeflow, or similar','Cloud-native infrastructure'],
    requirementsAr:['4+ سنوات خبرة في MLOps','خبرة في Kubernetes وDocker','خبرة في CI/CD','إلمام بـ MLflow أو Kubeflow','بنية تحتية سحابية حديثة'] },
  { title:'AI Research Engineer – NLP / LLMs', titleAr:'مهندس أبحاث ذكاء اصطناعي - معالجة اللغة والنماذج اللغوية', dept:'Research', category:'research', location:'Remote', type:'Full-Time', salMin:280000, salMax:420000, badge:'FEATURED', icon:'🧠', active:true,
    desc:'Push the frontier of large language models in Solvagence\'s dedicated AI Research team. Build novel NLP systems for Arabic and multilingual use cases.',
    descAr:'ادفع حدود النماذج اللغوية الكبيرة داخل فريق الأبحاث وطور أنظمة NLP جديدة للاستخدامات العربية ومتعددة اللغات.',
    requirements:['PhD or Master\'s in ML/NLP/CS','Transformer architectures & LLMs','Research publication track record','Fine-tuning experience (LoRA, RLHF)','Arabic NLP advantage'],
    requirementsAr:['ماجستير أو دكتوراه في ML أو NLP أو علوم الحاسب','خبرة في بنى Transformers وLLMs','سجل بحثي منشور','خبرة في Fine-tuning','ميزة إضافية لخبرة NLP العربية'] },
  { title:'Talent Acquisition Partner', titleAr:'شريك استقطاب المواهب', dept:'Operations', category:'operations', location:'Dubai, UAE', type:'Full-Time', salMin:150000, salMax:220000, badge:'', icon:'🌟', active:true,
    desc:'Own end-to-end recruitment for Solvagence\'s rapidly growing team of AI and consulting professionals.',
    descAr:'قد عملية التوظيف من البداية إلى النهاية لفريق سولفاجنس المتنامي من خبراء الذكاء الاصطناعي والاستشارات.',
    requirements:['4+ years technical recruitment','Experience hiring AI/ML engineers','ATS proficiency (LinkedIn Recruiter, Lever)','UAE/GCC market knowledge','Data-driven pipeline reporting'],
    requirementsAr:['4+ سنوات في التوظيف التقني','خبرة في توظيف مهندسي الذكاء الاصطناعي','إجادة أنظمة تتبع المتقدمين','معرفة بسوق الإمارات والخليج','تقارير قائمة على البيانات'] }
];

async function seedDatabase({ logger = console.log, updatedBy } = {}) {
  logger('🌱 Seeding database…');
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is required for seeding');
  }

  await Promise.all([
    Job.deleteMany(),
    Admin.deleteMany(),
    Application.deleteMany(),
    Subscriber.deleteMany(),
    Setting.deleteMany(),
  ]);
  logger('  ✓ Cleared existing data');

  const jobs = await Job.insertMany(JOBS);
  logger(`  ✓ ${jobs.length} jobs created`);

  await Admin.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
    displayName: 'Md Anwer',
    email: 'admin@solvagence.com',
  });
  logger('  ✓ Admin user created');

  const appsData = [
    { fname:'Tariq', lname:'Al Rashidi', email:'tariq@example.ae', phone:'+971501234567', location:'UAE – Dubai', exp:'8–12 years', job:jobs[0]._id, roleTitle:jobs[0].title, status:'Shortlisted', consentGiven:true, creditScore:{ score:88, notes:'Exceptional LLM production background. Strong SWF experience.', scoredBy:'admin', scoredAt:new Date() }, recruiterNotes:'Priority candidate. Visa transfer straightforward.' },
    { fname:'Priya', lname:'Sharma', email:'priya@example.in', phone:'+917891234567', location:'India', exp:'5–8 years', job:jobs[1]._id, roleTitle:jobs[1].title, status:'Reviewing', consentGiven:true, creditScore:{ score:74, notes:'Solid NLP portfolio. Visa sponsorship needed.', scoredBy:'admin', scoredAt:new Date() }, recruiterNotes:'Needs sponsorship — 4–6 week timeline.' },
    { fname:'James', lname:'Morrison', email:'james@example.co.uk', phone:'+447700900123', location:'United Kingdom', exp:'5–8 years', job:jobs[5]._id, roleTitle:jobs[5].title, status:'Hired', consentGiven:true, creditScore:{ score:95, notes:'Best MLOps candidate seen in 2 years. Hired.', scoredBy:'admin', scoredAt:new Date() }, recruiterNotes:'Start date Feb 1. DIFC visa processing.' },
    { fname:'Fatima', lname:'Al Zaabi', email:'fatima@example.ae', phone:'+971502345678', location:'UAE – Abu Dhabi', exp:'5–8 years', job:jobs[2]._id, roleTitle:jobs[2].title, status:'New', consentGiven:true },
    { fname:'Sara', lname:'Al Hassan', email:'sara@example.ae', phone:'+971553456789', location:'UAE – Dubai', exp:'5–8 years', job:jobs[2]._id, roleTitle:jobs[2].title, status:'Shortlisted', consentGiven:true, creditScore:{ score:82, notes:'Strong consulting background. Emirati national — Nafis priority.', scoredBy:'admin', scoredAt:new Date() } },
    { fname:'Michael', lname:'Brennan', email:'michael@example.ie', phone:'+353876543210', location:'United Kingdom', exp:'8–12 years', job:jobs[4]._id, roleTitle:jobs[4].title, status:'Rejected', consentGiven:true, creditScore:{ score:51, notes:'GCC network too thin for this stage.', scoredBy:'admin', scoredAt:new Date() } },
    { fname:'Noura', lname:'Al Mansoori', email:'noura@example.ae', phone:'+971554567890', location:'UAE – Dubai', exp:'5–8 years', job:jobs[7]._id, roleTitle:jobs[7].title, status:'Reviewing', consentGiven:true, creditScore:{ score:79, notes:'Strong internal TA background from MAF.', scoredBy:'admin', scoredAt:new Date() } },
    { fname:'Ravi', lname:'Krishnamurthy', email:'ravi@example.in', phone:'+919876543210', location:'India', exp:'2–5 years', job:jobs[3]._id, roleTitle:jobs[3].title, status:'New', consentGiven:true },
  ];
  await Application.insertMany(appsData);
  logger(`  ✓ ${appsData.length} sample applications created`);

  const subsData = [
    { fname:'Khaled', lname:'Al Otaibi', email:'khaled@example.sa', phone:'+966501234567', location:'Saudi Arabia', interest:'AI Strategy & Consulting', marketing:true, consentGiven:true },
    { fname:'Ananya', lname:'Patel', email:'ananya@example.in', phone:'+919876543211', location:'India', interest:'AI/ML Engineering', linkedin:'https://linkedin.com/in/ananyapatel', marketing:false, consentGiven:true },
    { fname:'David', lname:'Chen', email:'david@example.com', phone:'+442079461234', location:'United Kingdom', interest:'AI Strategy & Consulting', marketing:true, consentGiven:true },
    { fname:'Amira', lname:'Khalil', email:'amira@example.eg', phone:'+201001234567', location:'Egypt', interest:'Data Science & Analytics', marketing:false, consentGiven:true },
  ];
  await Subscriber.insertMany(subsData);
  logger(`  ✓ ${subsData.length} subscribers created`);

  await Setting.create({
    key: 'global',
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
    publicContentAr: {
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
    },
    updatedBy: updatedBy || process.env.ADMIN_USERNAME || 'admin',
  });
  logger('  ✓ Settings created');

  return {
    jobs: jobs.length,
    applications: appsData.length,
    subscribers: subsData.length,
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
  };
}

module.exports = { seedDatabase };
