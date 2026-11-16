# LinkForge — AWS EC2 Deployment Guide

> **Prerequisites:** AWS account with \$100 credits · GitHub account · Git installed locally · Terraform installed

---

## Overview — What Happens End to End

```
Your Machine → GitHub → GitHub Actions CI → ECR (Docker images) → EC2 (live app)
```

1. You push code to GitHub
2. GitHub Actions builds Docker images and pushes them to Amazon ECR
3. GitHub Actions SSHes into your EC2 instance and runs `docker compose up`
4. Your app is live at your EC2 IP or domain

---

## ✅ YES — Push to GitHub First

**GitHub is required** because:
- GitHub Actions (CI/CD) runs from your repo
- The EC2 instance pulls your `docker-compose.yml` and config from GitHub
- ECR image tags reference GitHub commit SHAs

---

## PHASE 1 — Push Code to GitHub

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Name it `linkforge` (or anything you like)
3. Set to **Public** or **Private** — either works
4. Do **NOT** add README/gitignore (your project already has them)
5. Click **Create repository**

### Step 2: Push from your machine
Open a terminal in `d:\URL-SHORTNER` and run:

```bash
git init
git add .
git commit -m "Initial commit — LinkForge URL shortener"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/linkforge.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

---

## PHASE 2 — AWS Account Setup

### Step 3: Create IAM User for Deployment

1. Go to **AWS Console → IAM → Users → Create user**
2. Username: `linkforge-deployer`
3. Attach policy: `AdministratorAccess` (simplest for now; scope down later)
4. After creation → **Security credentials → Create access key**
5. Choose **"Application running outside AWS"**
6. **Save the Access Key ID and Secret** — you'll need these shortly

### Step 4: Create EC2 Key Pair

1. Go to **AWS Console → EC2 → Key Pairs → Create key pair**
2. Name: `linkforge-key`
3. Key pair type: **RSA**
4. Private key format: **.pem**
5. Click **Create** → `.pem` file downloads automatically
6. Move it somewhere safe: `mv ~/Downloads/linkforge-key.pem ~/.ssh/`
7. Set permissions: `chmod 400 ~/.ssh/linkforge-key.pem`

### Step 5: Find Your Public IP

Go to https://checkip.amazonaws.com and note your IP (e.g. `203.0.113.42`).

---

## PHASE 3 — Configure Terraform

### Step 6: Edit `infra/terraform/terraform.tfvars`

Copy the example file and fill it in:

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
aws_region       = "us-east-1"        # or closest region to you
environment      = "production"
instance_type    = "t3.small"          # ~$15/month, runs all containers
ssh_key_name     = "linkforge-key"     # must match the name you created in Step 4
allowed_ssh_cidr = "203.0.113.42/32"  # YOUR IP from Step 5
```

> `terraform.tfvars` is in `.gitignore` — it will not be pushed to GitHub. ✅

### Step 7: Run Terraform

```bash
cd infra/terraform

# Install AWS CLI and configure with your keys from Step 3
aws configure
# AWS Access Key ID: (paste from Step 3)
# AWS Secret Access Key: (paste from Step 3)
# Default region: us-east-1
# Default output format: json

# Initialize Terraform
terraform init

# Preview what will be created
terraform plan

# Create EC2 instance + ECR repos + IAM role + Security Group
terraform apply
# Type "yes" when prompted
```

After `terraform apply` completes, run:

```bash
terraform output
```

**Note down the EC2 public IP** — you'll need it for the next steps.

---

## PHASE 4 — Bootstrap the EC2 Instance

### Step 8: SSH Into EC2

```bash
ssh -i ~/.ssh/linkforge-key.pem ubuntu@YOUR_EC2_IP
```

### Step 9: Create the Production Environment File

On the EC2 instance, generate two strong JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run this command twice — save both outputs
```

Then create the env file:

```bash
nano ~/linkforge.env.production
```

Paste and fill in (use `.env.production.example` from the repo as reference):

```dotenv
NODE_ENV=production
API_PORT=4000

PUBLIC_APP_URL=http://YOUR_EC2_IP
API_BASE_URL=http://YOUR_EC2_IP
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_IP

MONGODB_URI=mongodb://mongodb:27017/linkforge
REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=PASTE_FIRST_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_SECOND_SECRET_HERE
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

LOG_LEVEL=info
METRICS_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Step 10: Fix nginx.conf — Set Your EC2 IP

Back on your **local machine**, open `infra/nginx/nginx.conf` and replace every occurrence of `YOUR_DOMAIN_OR_IP` with your EC2 public IP.

> **No domain yet?** Change the first server block from `return 301 https://...` to serve HTTP directly (port 80) and remove the SSL certificate lines from the second server block. You can add HTTPS later.

Commit and push:

```bash
git add infra/nginx/nginx.conf
git commit -m "fix: set EC2 IP in nginx server_name"
git push origin main
```

---

## PHASE 5 — Set GitHub Secrets

### Step 11: Add All 5 Secrets

Go to: **GitHub → Your Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Where to Find the Value |
|-------------|------------------------|
| `AWS_ACCESS_KEY_ID` | From Step 3 — IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | From Step 3 — IAM secret access key |
| `AWS_REGION` | `us-east-1` (or your region) |
| `EC2_HOST` | EC2 public IP from `terraform output` |
| `EC2_SSH_KEY` | Full contents of `linkforge-key.pem` file |

To copy the PEM file contents:
```bash
# Mac/Linux
cat ~/.ssh/linkforge-key.pem | pbcopy

# Windows PowerShell
Get-Content $HOME\.ssh\linkforge-key.pem | Set-Clipboard
```

---

## PHASE 6 — First Deployment

### Step 12: SSH Into EC2 and Start the App

```bash
ssh -i ~/.ssh/linkforge-key.pem ubuntu@YOUR_EC2_IP

# Clone your repo onto the server
sudo mkdir -p /opt/linkforge
sudo chown ubuntu:ubuntu /opt/linkforge
git clone https://github.com/YOUR_USERNAME/linkforge.git /opt/linkforge
cd /opt/linkforge

# Copy your env file
cp ~/linkforge.env.production .env.production

# Authenticate Docker with ECR
# (replace ACCOUNT_ID with your 12-digit AWS account number)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Start everything
docker compose up -d

# Check all containers are running
docker compose ps

# Verify health
curl http://localhost/health/ready
```

### Step 13: Open in Browser

```
http://YOUR_EC2_IP              → LinkForge landing page  ✅
http://YOUR_EC2_IP/health/live  → {"status":"ok"}         ✅
```

---

## PHASE 7 — Every Future Deploy is Automatic

From now on, every time you push to `main`:

```bash
git add .
git commit -m "your change"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build Docker images
2. ✅ Push to ECR (tagged with commit SHA)
3. ✅ SSH into EC2 and deploy
4. ✅ Run health check — rolls back if it fails

Watch it live at: **GitHub → Your Repo → Actions tab**

---

## OPTIONAL — Add HTTPS with Let's Encrypt

Requires a domain name pointed to your EC2 IP (via an A record in your DNS provider).

```bash
# On EC2
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Follow prompts
```

Then update `nginx.conf` with your real domain name, push, and redeploy.

---

## Cost Reference

| Resource | Monthly Cost |
|----------|-------------|
| EC2 `t3.small` | ~\$15.00 |
| Elastic IP | ~\$3.60 |
| ECR (3 repos, ~500 MB) | ~\$0.05 |
| Data transfer (first 100 GB free) | \$0.00 |
| **Total** | **~\$19/month** |

**\$100 credits = ~5 months of free hosting** ✅

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `terraform apply` fails | Run `aws configure` first and check IAM permissions |
| Can't SSH into EC2 | Your IP may have changed — update `allowed_ssh_cidr` in `terraform.tfvars` and re-apply |
| `docker compose up` fails | Run `docker compose logs api` to see the error |
| Health check returns 503 | MongoDB starting up — wait 30s: `docker compose logs mongodb` |
| App loads but API calls fail | Check `NEXT_PUBLIC_API_URL` in `.env.production` matches EC2 IP |
| Nginx 502 Bad Gateway | API container not ready — wait 30s and refresh |
| GitHub Actions fails at ECR push | Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets are correct |

---

## Quick Reference — Useful Commands on EC2

```bash
# View logs for all services
docker compose logs -f

# Restart just the API
docker compose restart api

# Check health
curl http://localhost/health/ready

# Manual update (pull latest from GitHub without CI)
cd /opt/linkforge
git pull origin main
docker compose up -d --remove-orphans

# Stop everything
docker compose down

# Check disk/image usage
docker system df
```
