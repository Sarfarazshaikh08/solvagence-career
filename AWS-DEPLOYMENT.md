# Solvagence Careers Portal — AWS Deployment Guide
# MERN Stack · EC2 + S3 + MongoDB Atlas + Nginx + PM2

## Architecture Overview

```
Internet → Route 53 (careers.solvagence.com)
         → AWS Certificate Manager (SSL/TLS)
         → EC2 t3.medium (Nginx reverse proxy)
             ├── /api/*  → PM2 Node.js (port 5000)
             └── /*      → React dist (static files)
         → S3 Bucket (resume file storage)
         → MongoDB Atlas (M10+ cluster, GCC region)
```

---

## STEP 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Create account
2. Create Cluster → **M10** (minimum for production) → Region: **UAE (Dubai)** or **Bahrain**
3. Create Database User: Database → Database Access → Add New User
   - Username: `solvagence_prod`
   - Password: strong generated password
   - Role: `readWriteAnyDatabase`
4. Network Access → Add IP Address → Add your EC2 Elastic IP (or `0.0.0.0/0` temporarily)
5. Connect → Drivers → Copy connection string:
   ```
   mongodb+srv://solvagence_prod:<password>@cluster.mongodb.net/solvagence_careers
   ```

---

## STEP 2 — S3 Bucket (Resume Storage)

### 2a. Create Bucket
```
AWS Console → S3 → Create Bucket
Bucket name:  solvagence-careers-resumes
Region:       me-central-1 (UAE)  OR  ap-south-1 (India)
Block all public access: ✓ ENABLED (resumes accessed via presigned URLs only)
Versioning: Enabled
```

### 2b. Bucket CORS Policy
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://careers.solvagence.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 2c. Create IAM User for S3 Access
```
IAM → Users → Create User → solvagence-careers-s3
Attach policy → AmazonS3FullAccess  (or create scoped policy below)
```

**Scoped IAM Policy (recommended):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:GetObjectAcl"],
      "Resource": "arn:aws:s3:::solvagence-careers-resumes/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::solvagence-careers-resumes"
    }
  ]
}
```

Create Access Key → Download CSV → you'll need `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

---

## STEP 3 — EC2 Instance Setup

### 3a. Launch Instance
```
AWS Console → EC2 → Launch Instance
AMI:          Ubuntu Server 22.04 LTS
Instance type: t3.medium (2 vCPU, 4GB RAM)  — minimum for Node + Nginx
Storage:      20 GB gp3
Key pair:     Create → solvagence-careers-key.pem → Download
Security Group (Inbound):
  HTTP   port 80   → 0.0.0.0/0
  HTTPS  port 443  → 0.0.0.0/0
  SSH    port 22   → Your IP only
Elastic IP: Allocate → Associate to instance
```

### 3b. Connect to EC2
```bash
chmod 400 solvagence-careers-key.pem
ssh -i solvagence-careers-key.pem ubuntu@<ELASTIC_IP>
```

### 3c. Install Dependencies
```bash
# System update
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# Verify versions
node --version   # v20.x
npm --version    # 10.x
pm2 --version
nginx -v
```

---

## STEP 4 — Deploy Application

### 4a. Upload project to EC2
```bash
# Option A: Git (recommended)
sudo apt install -y git
cd /var/www
sudo git clone https://github.com/your-org/solvagence-careers.git
sudo chown -R ubuntu:ubuntu solvagence-careers

# Option B: SCP from local machine
scp -i solvagence-careers-key.pem -r ./solvagence-careers ubuntu@<ELASTIC_IP>:/var/www/
```

### 4b. Configure Environment Variables
```bash
cd /var/www/solvagence-careers/backend
cp .env.example .env
nano .env
```

**Fill in your .env:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://solvagence_prod:<password>@cluster.mongodb.net/solvagence_careers
JWT_SECRET=<generate-with: openssl rand -base64 64>
JWT_EXPIRES_IN=8h
AWS_REGION=me-central-1
AWS_ACCESS_KEY_ID=<from IAM CSV>
AWS_SECRET_ACCESS_KEY=<from IAM CSV>
AWS_S3_BUCKET=solvagence-careers-resumes
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
CLIENT_ORIGIN=https://careers.solvagence.com
MAX_FILE_SIZE_MB=10
```

### 4c. Install & Seed Backend
```bash
cd /var/www/solvagence-careers/backend
npm install --production
npm run seed    # Creates admin user + seed jobs
```

### 4d. Build React Frontend
```bash
cd /var/www/solvagence-careers/frontend
npm install
npm run build   # Outputs to frontend/dist/
```

### 4e. Start with PM2
```bash
cd /var/www/solvagence-careers/backend

# Start API
pm2 start server.js --name "solvagence-careers-api"

# Auto-restart on reboot
pm2 startup
pm2 save

# Verify running
pm2 status
pm2 logs solvagence-careers-api
```

---

## STEP 5 — Nginx Configuration

### 5a. Create site config
```bash
sudo nano /etc/nginx/sites-available/solvagence-careers
```

**Paste this config:**
```nginx
server {
    listen 80;
    server_name careers.solvagence.com;

    # Redirect HTTP to HTTPS (after SSL is set up)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name careers.solvagence.com;

    # SSL (Certbot will fill these in)
    ssl_certificate     /etc/letsencrypt/live/careers.solvagence.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/careers.solvagence.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options         "SAMEORIGIN"  always;
    add_header X-XSS-Protection        "1; mode=block" always;
    add_header X-Content-Type-Options  "nosniff"     always;
    add_header Referrer-Policy         "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # File upload size limit (match backend MAX_FILE_SIZE_MB)
    client_max_body_size 12M;

    # ── API proxy ────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # ── Local dev uploads (remove in production if using S3 only) ──
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # ── React SPA ────────────────────────────────────────────────
    location / {
        root  /var/www/solvagence-careers/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;  # SPA fallback

        # Cache static assets
        location ~* \.(js|css|png|svg|ico|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 5b. Enable site & test
```bash
sudo ln -s /etc/nginx/sites-available/solvagence-careers /etc/nginx/sites-enabled/
sudo nginx -t           # Test config — should say "ok"
sudo systemctl restart nginx
```

---

## STEP 6 — SSL Certificate (HTTPS)

### 6a. Point DNS first
In your domain registrar (e.g. GoDaddy, Namecheap, or Route 53):
```
Type: A
Name: careers
Value: <EC2 Elastic IP>
TTL:  300
```
Wait 5–10 minutes for DNS propagation.

### 6b. Issue certificate
```bash
sudo certbot --nginx -d careers.solvagence.com
# Follow prompts → Enter email → Agree → Choose redirect (option 2)
```

### 6c. Auto-renewal
```bash
sudo certbot renew --dry-run   # Test auto-renewal
# Certbot installs a cron job automatically
```

---

## STEP 7 — Route 53 (if using AWS DNS)

```
AWS Console → Route 53 → Hosted Zones → solvagence.com
→ Create Record
  Record name:  careers
  Record type:  A
  Value:        <EC2 Elastic IP>
  TTL:          300
```

---

## STEP 8 — Verify Deployment

```bash
# Health check
curl https://careers.solvagence.com/api/health

# Expected response:
# {"success":true,"status":"healthy","env":"production","ts":"..."}

# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# Application logs
pm2 logs solvagence-careers-api --lines 50
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## STEP 9 — Post-Deployment Checklist

- [ ] `https://careers.solvagence.com` loads correctly
- [ ] Admin login works: `/admin/login`
- [ ] Job listings appear on public site
- [ ] Resume upload works (PDF uploads to S3)
- [ ] Admin can preview resume and set credit score
- [ ] HTTPS padlock shown (SSL working)
- [ ] MongoDB Atlas shows active connections
- [ ] S3 bucket shows uploaded files
- [ ] PM2 shows status `online`
- [ ] `npm run seed` was run (admin user created)

---

## Update / Redeploy Workflow

```bash
# SSH into EC2
cd /var/www/solvagence-careers
git pull origin main

# Backend changes
cd backend && npm install --production
pm2 restart solvagence-careers-api

# Frontend changes
cd ../frontend
npm install
npm run build     # Rebuilds dist/

# Nginx reload (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## Environment Variables Reference

| Variable               | Required | Description                              |
|------------------------|----------|------------------------------------------|
| `NODE_ENV`             | Yes      | `production`                             |
| `PORT`                 | Yes      | `5000` (internal)                        |
| `MONGO_URI`            | Yes      | MongoDB Atlas connection string          |
| `JWT_SECRET`           | Yes      | Min 64-char random string                |
| `JWT_EXPIRES_IN`       | Yes      | e.g. `8h`                               |
| `AWS_REGION`           | Yes      | e.g. `me-central-1`                     |
| `AWS_ACCESS_KEY_ID`    | Yes      | IAM user key                             |
| `AWS_SECRET_ACCESS_KEY`| Yes      | IAM user secret                          |
| `AWS_S3_BUCKET`        | Yes      | S3 bucket name                           |
| `ADMIN_USERNAME`       | Seed     | Initial admin username                   |
| `ADMIN_PASSWORD`       | Seed     | Initial admin password (min 8 chars)     |
| `CLIENT_ORIGIN`        | Yes      | `https://careers.solvagence.com`         |
| `MAX_FILE_SIZE_MB`     | No       | Default `10`                             |

---

## Recommended Instance Sizing

| Stage        | EC2 Type    | Cost (est.)  | Notes                    |
|--------------|-------------|--------------|--------------------------|
| MVP / Dev    | t3.micro    | ~$8/mo       | Free tier eligible       |
| Production   | t3.medium   | ~$33/mo      | Recommended minimum      |
| Scale        | t3.large    | ~$60/mo      | 100+ concurrent users    |
| High traffic | c5.xlarge   | ~$150/mo     | Add load balancer        |

**MongoDB Atlas:**
- Dev: M0 (Free) — 512MB
- Production: M10 (~$57/mo) — 10GB, dedicated cluster

**S3 costs:** ~$0.023/GB storage + $0.005/1K PUT requests — negligible for resume uploads.

---

## Troubleshooting

**502 Bad Gateway:**
```bash
pm2 status          # Is API running?
pm2 restart solvagence-careers-api
sudo systemctl restart nginx
```

**MongoDB connection refused:**
- Check Atlas Network Access → your EC2 Elastic IP is whitelisted
- Verify `MONGO_URI` in `.env` is correct

**Resume upload fails:**
- Verify AWS keys are correct
- Check S3 bucket name matches `AWS_S3_BUCKET`
- Check S3 CORS policy includes your domain
- In dev mode: `NODE_ENV=development` stores files locally in `/uploads`

**SSL certificate issues:**
```bash
sudo certbot certificates     # List certs
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Admin login fails:**
```bash
cd /var/www/solvagence-careers/backend
npm run seed    # Recreates admin user
# Login: admin / <ADMIN_PASSWORD from .env>
```
