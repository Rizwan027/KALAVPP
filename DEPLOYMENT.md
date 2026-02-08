# KALAVPP - Deployment Guide

Complete guide for deploying KALAVPP to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment](#post-deployment)

## Prerequisites

### Required Services
- PostgreSQL database (AWS RDS, DigitalOcean, or similar)
- Redis instance (AWS ElastiCache, DigitalOcean, or similar)
- AWS S3 bucket or Cloudinary account
- Stripe account (live mode)
- Domain name with SSL certificate

### Required Accounts
- Vercel (for frontend) or AWS/DigitalOcean
- Railway, Heroku, or AWS EC2 (for backend)
- SendGrid or AWS SES (for emails)

## Environment Setup

### Backend Environment Variables (.env)
```bash
# Production
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/kalavpp_prod

# Redis
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://kalavpp.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_COMMISSION_RATE=10

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=kalavpp-prod-assets
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net

# Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@kalavpp.com
EMAIL_FROM_NAME=KALAVPP

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# URLs
FRONTEND_URL=https://kalavpp.com
ADMIN_PANEL_URL=https://kalavpp.com/admin

# Logging
LOG_LEVEL=error
```

### Frontend Environment Variables (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.kalavpp.com/api/v1
NEXT_PUBLIC_SITE_URL=https://kalavpp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
NODE_ENV=production
```

## Database Deployment

### Option 1: AWS RDS PostgreSQL

1. **Create RDS Instance**
   ```bash
   # Via AWS Console or CLI
   aws rds create-db-instance \
     --db-instance-identifier kalavpp-prod \
     --db-instance-class db.t3.medium \
     --engine postgres \
     --engine-version 15.3 \
     --master-username admin \
     --master-user-password YourSecurePassword \
     --allocated-storage 100 \
     --storage-type gp3 \
     --vpc-security-group-ids sg-xxxxxxxx \
     --backup-retention-period 7 \
     --multi-az
   ```

2. **Configure Security Group**
   - Allow inbound PostgreSQL (5432) from backend servers
   - Restrict to specific IPs or VPC

3. **Run Migrations**
   ```bash
   cd backend
   DATABASE_URL=postgresql://... npm run prisma:migrate
   ```

### Option 2: DigitalOcean Managed Database

1. Create PostgreSQL cluster via DigitalOcean console
2. Configure connection pooling
3. Add trusted sources (backend IP addresses)
4. Run migrations

## Backend Deployment

### Option 1: Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   cd backend
   railway init
   ```

3. **Configure Environment Variables**
   ```bash
   # Add all environment variables via Railway dashboard
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Setup Custom Domain**
   - Add domain in Railway dashboard: api.kalavpp.com
   - Configure DNS CNAME record

### Option 2: AWS EC2 + PM2

1. **Launch EC2 Instance**
   - t3.medium or larger
   - Ubuntu 22.04 LTS
   - Configure security groups (80, 443, 22)

2. **Install Dependencies**
   ```bash
   # SSH into instance
   ssh ubuntu@your-ec2-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt update
   sudo apt install nginx
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/your-org/kalavpp.git
   cd kalavpp/backend
   npm install
   npm run build
   ```

4. **Configure PM2**
   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'kalavpp-api',
       script: './dist/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   };

   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/kalavpp-api
   server {
       listen 80;
       server_name api.kalavpp.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }

   # Enable site
   sudo ln -s /etc/nginx/sites-available/kalavpp-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.kalavpp.com
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Add production env vars in Vercel dashboard
   - NEXT_PUBLIC_API_URL
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

4. **Setup Custom Domain**
   - Add domain in Vercel: kalavpp.com
   - Configure DNS records

### Option 2: AWS Amplify

1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push

## Redis Deployment

### AWS ElastiCache
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id kalavpp-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --engine-version 7.0
```

### DigitalOcean Managed Redis
1. Create Redis cluster via console
2. Configure connection pooling
3. Add trusted sources

## Post-Deployment

### 1. Database Seeding
```bash
cd backend
npm run prisma:seed
```

### 2. Health Checks
```bash
# Backend
curl https://api.kalavpp.com/health

# Frontend
curl https://kalavpp.com
```

### 3. Monitoring Setup

**Backend Monitoring (PM2)**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Error Tracking (Sentry)**
```bash
# Install Sentry SDK
npm install @sentry/node

# Configure in backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "your-sentry-dsn" });
```

### 4. Backup Configuration

**Database Backups**
```bash
# Automated daily backups (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/kalavpp_$(date +\%Y\%m\%d).sql
```

**S3 Versioning**
- Enable versioning on S3 bucket
- Configure lifecycle policies

### 5. SSL/TLS
- Ensure all endpoints use HTTPS
- Configure HSTS headers
- Test with SSL Labs

### 6. Performance Optimization
- Enable Cloudflare CDN
- Configure caching headers
- Enable Gzip compression
- Monitor with Google PageSpeed

### 7. Security Checklist
- [ ] Environment variables secured
- [ ] Database has strong passwords
- [ ] JWT secrets are random and long
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled
- [ ] HTTPS enforced
- [ ] Security headers configured (Helmet)
- [ ] Stripe webhooks verified

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Deploy to Railway/AWS

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      # Deploy to Vercel
```

## Rollback Procedure

### Backend
```bash
# PM2
pm2 list
pm2 reload kalavpp-api

# Railway
railway rollback
```

### Frontend (Vercel)
- Use Vercel dashboard to rollback to previous deployment

## Monitoring & Logging

### Application Logs
```bash
# PM2
pm2 logs kalavpp-api

# Check errors
pm2 logs kalavpp-api --err
```

### Database Monitoring
- Monitor query performance
- Check connection pool usage
- Set up alerts for slow queries

### Uptime Monitoring
- Use UptimeRobot or similar
- Monitor API endpoints
- Set up alerts

## Estimated Costs (Monthly)

### Minimum Setup
- Database (DigitalOcean): $15
- Backend (Railway): $5
- Frontend (Vercel): Free
- Redis (DigitalOcean): $15
- S3 Storage: ~$5
- **Total: ~$40/month**

### Production Setup
- Database (AWS RDS t3.medium): $60
- Backend (EC2 t3.medium): $35
- Frontend (Vercel Pro): $20
- Redis (ElastiCache): $25
- S3 + CloudFront: $20
- Stripe fees: Variable
- **Total: ~$160/month + transaction fees**

## Support & Troubleshooting

### Common Issues

**Database Connection Failed**
- Check security group rules
- Verify DATABASE_URL format
- Ensure VPC configuration

**CORS Errors**
- Verify CORS_ORIGIN matches frontend URL
- Check protocol (http vs https)

**Payment Failures**
- Verify Stripe webhook endpoint
- Check webhook secret
- Monitor Stripe dashboard

## Additional Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Stripe Integration](https://stripe.com/docs)
