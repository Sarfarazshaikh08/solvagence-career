# Solvagence AI Consulting — Careers Portal
### Full-Stack MERN Application · DIFC Dubai

> Enterprise-grade careers portal for Solvagence AI Consulting Limited.  
> Built with MongoDB · Express.js · React 18 · Node.js · AWS S3

---

## Features

**Public Portal**
- Responsive careers site with Solvagence design system (Dark Luxury · Electric Blue)
- Job listings with real-time search and category filtering
- Resume / CV upload (PDF, DOC, DOCX) with drag-and-drop
- Career alerts subscription form
- PDPL & DIFC Data Protection Law 2020 compliant

**Admin Dashboard**
- JWT-authenticated admin portal
- **Candidates** — full table with search, status pipeline, CSV export
- **Resume Preview** — inline PDF viewer + download link
- **Credit Score System** — admin scores each candidate 0–100 with visual ring gauge, slider input, and notes. Score colour-codes by match quality (Strong / Partial / Weak)
- **Job Postings** — create, activate/pause, delete roles
- **Subscribers** — manage career alert registrations
- **Analytics** — pipeline funnel, nationality breakdown, experience distribution
- **Settings** — company info, password change, notification toggles

---

## Tech Stack

| Layer      | Technology                                 |
|------------|---------------------------------------------|
| Frontend   | React 18 · Vite 5 · React Router v6         |
| Backend    | Node.js 20 · Express 4 · JWT Auth           |
| Database   | MongoDB 7 · Mongoose 8                      |
| File Storage | AWS S3 (prod) · Local disk (dev)          |
| Security   | Helmet · CORS · Rate limiting · bcryptjs    |
| Deployment | AWS EC2 · Nginx · PM2 · MongoDB Atlas       |

---

## Local Development

### Prerequisites
- Node.js 20+
- MongoDB (local) or MongoDB Atlas URI
- AWS S3 bucket (optional for dev — falls back to local disk)

### 1. Clone & configure
```bash
git clone <repo>
cd solvagence-careers
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI at minimum
npm install
npm run seed     # Seed admin + 8 jobs + sample data
npm run dev      # Starts on port 5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev      # Starts on port 5173, proxies /api → port 5000
```

### 4. Open browser
- **Public site:** http://localhost:5173
- **Admin:** http://localhost:5173/admin/login
- **Login:** `admin` / `Solvagence@2025!` (set in .env)

---

## Admin: Credit Score Feature

Each candidate application has a **Profile Match Credit Score** (0–100):

| Range  | Label        | Colour  |
|--------|--------------|---------|
| 75–100 | Strong Match | 🟢 Teal |
| 50–74  | Partial Match| 🟡 Amber|
| 0–49   | Weak Match   | 🔴 Red  |

To score a candidate:
1. Admin → Candidates → click 👁 (View) on any candidate
2. Click **Score** tab in the slide-out panel
3. Drag the slider or type a number (0–100)
4. Add scoring notes explaining the rationale
5. Click **Save Credit Score**

The score appears on the candidates table, dashboard recent applications, and analytics.

---

## Resume Upload Flow

1. **Candidate applies** → uploads PDF/DOC/DOCX via drag-and-drop
2. **Backend (Multer)**:
   - Dev: saves to `/backend/uploads/` folder
   - Prod: uploads to AWS S3 with UUID filename under `resumes/` prefix
3. **Admin previews**:
   - Click candidate → Resume tab
   - PDF files render inline via `<iframe>`
   - DOC/DOCX shows download button
   - Generates S3 presigned URL (15 min expiry) for secure access

---

## Project Structure

```
solvagence-careers/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               JWT protect middleware
│   │   └── upload.js             Multer S3/disk storage
│   ├── models/
│   │   ├── Admin.js              Admin user model (bcrypt)
│   │   ├── Application.js        Application + resume + credit score
│   │   ├── Job.js                Job posting model
│   │   └── Subscriber.js         Career alert subscriber
│   ├── routes/
│   │   ├── auth.js               Login · /me · change password
│   │   ├── jobs.js               Public + admin CRUD
│   │   ├── applications.js       Submit · review · score · resume URL
│   │   └── subscribers.js        Subscribe · list · delete
│   ├── scripts/seed.js           Database seed script
│   ├── server.js                 Express app entry
│   ├── .env.example              Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/index.js          Axios client + all API calls
│   │   ├── context/AuthContext   JWT auth state
│   │   ├── components/
│   │   │   ├── Toast.jsx         Global toast notification
│   │   │   ├── ScoreRing.jsx     SVG credit score ring
│   │   │   └── ResumeUpload.jsx  Drag & drop file upload
│   │   └── pages/
│   │       ├── CareersPage.jsx   Full public site
│   │       ├── AdminLogin.jsx    Login page
│   │       └── admin/
│   │           ├── AdminLayout   Sidebar + outlet
│   │           ├── Dashboard     Stats + charts
│   │           ├── Candidates    Table + panel + score + resume
│   │           ├── Subscribers   Subscriber management
│   │           ├── JobPostings   Job CRUD + toggle
│   │           ├── Analytics     Charts + reporting
│   │           └── Settings      Config + password
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── AWS-DEPLOYMENT.md             Step-by-step AWS guide
└── README.md
```

---

## API Endpoints

| Method | Endpoint                              | Auth   | Description                    |
|--------|---------------------------------------|--------|--------------------------------|
| POST   | `/api/auth/login`                     | Public | Admin login → JWT              |
| GET    | `/api/auth/me`                        | Admin  | Verify token                   |
| PUT    | `/api/auth/password`                  | Admin  | Change password                |
| GET    | `/api/jobs`                           | Public | Active jobs (filter/search)    |
| GET    | `/api/jobs/:id`                       | Public | Single job                     |
| GET    | `/api/jobs/admin/all`                 | Admin  | All jobs + app counts          |
| POST   | `/api/jobs`                           | Admin  | Create job                     |
| PUT    | `/api/jobs/:id`                       | Admin  | Update job                     |
| DELETE | `/api/jobs/:id`                       | Admin  | Delete job                     |
| POST   | `/api/applications`                   | Public | Submit application + resume    |
| GET    | `/api/applications`                   | Admin  | List (paginated, filtered)     |
| GET    | `/api/applications/admin/stats`       | Admin  | Dashboard stats                |
| GET    | `/api/applications/:id`               | Admin  | Single application             |
| PATCH  | `/api/applications/:id/status`        | Admin  | Update pipeline status         |
| PATCH  | `/api/applications/:id/credit-score`  | Admin  | Set profile match score        |
| PATCH  | `/api/applications/:id/notes`         | Admin  | Update recruiter notes         |
| GET    | `/api/applications/:id/resume-url`    | Admin  | Presigned S3 URL for resume    |
| DELETE | `/api/applications/:id`               | Admin  | Delete application             |
| POST   | `/api/subscribers`                    | Public | Subscribe to career alerts     |
| GET    | `/api/subscribers`                    | Admin  | List subscribers               |
| DELETE | `/api/subscribers/:id`                | Admin  | Remove subscriber              |

---

## Deployment

See **[AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md)** for complete step-by-step instructions including:
- MongoDB Atlas setup
- S3 bucket + IAM policy
- EC2 launch + security groups
- Nginx reverse proxy config
- SSL/TLS with Let's Encrypt (Certbot)
- Route 53 DNS
- PM2 process management
- Monitoring and troubleshooting

---

## Compliance

- UAE Federal Decree-Law No. 45/2021 (PDPL) — consent required on all forms
- DIFC Data Protection Law 2020 — referenced in Privacy Policy modal
- UAE Labour Law — Equal Opportunity statement
- Nafis / Emiratisation — explicitly referenced throughout careers content
- Resumes accessed via presigned URLs only (no public S3 exposure)

---

*Built for Solvagence AI Consulting Limited · DIFC, Dubai, UAE · solvagence.com*
