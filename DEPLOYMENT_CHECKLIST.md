# KALAVPP - Production Deployment Checklist

**Version**: 1.0  
**Date**: February 8, 2026  
**Status**: Ready for Production

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Configuration

#### Backend Environment Variables (.env)
```bash
# Required - Application
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Required - Database
DATABASE_URL=postgresql://username:password@host:5432/kalavpp_production

# Required - Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Required - JWT
JWT_SECRET=CHANGE-TO-STRONG-RANDOM-STRING-64-CHARS
JWT_REFRESH_SECRET=CHANGE-TO-DIFFERENT-STRONG-RANDOM-STRING-64-CHARS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Required - Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_COMMISSION_RATE=10

# Required - URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
CORS_ORIGIN=https://your-domain.com

# Optional - AWS S3 (if using cloud storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=kalavpp-production

# Optional - Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=KALAVPP

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
NEXT_PUBLIC_APP_NAME=KALAVPP
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**✅ Tasks:**
- [ ] Generate strong JWT secrets (min 64 characters random)
- [ ] Configure production database
- [ ] Set up Redis instance
- [ ] Configure Stripe live keys
- [ ] Set correct URLs and origins
- [ ] Review all security settings

---

### 2. Database Setup

#### PostgreSQL Database
```bash
# Create production database
createdb kalavpp_production

# Run Prisma migrations
cd backend
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**✅ Tasks:**
- [ ] Create production database
- [ ] Run all migrations
- [ ] Create admin user account
- [ ] Seed initial categories (if needed)
- [ ] Set up database backups
- [ ] Configure connection pooling

---

### 3. Stripe Configuration

#### Required Stripe Setup
1. **Get Live API Keys:**
   - Dashboard → Developers → API keys
   - Copy live secret key → Backend .env
   - Copy live publishable key → Frontend .env

2. **Set Up Webhooks:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://api.your-domain.com/api/v1/payments/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy webhook secret → Backend .env

3. **Test Payments:**
   - Use Stripe test mode first
   - Verify checkout flow
   - Test webhook delivery
   - Switch to live mode

**✅ Tasks:**
- [ ] Create Stripe account (if not exists)
- [ ] Get live API keys
- [ ] Configure webhook endpoint
- [ ] Test payment flow in test mode
- [ ] Verify webhook events
- [ ] Activate live mode

---

### 4. File Upload Configuration

#### Local Storage (Default)
```bash
# Create uploads directory
mkdir -p backend/uploads
chmod 755 backend/uploads
```

#### AWS S3 (Recommended for Production)
1. Create S3 bucket
2. Configure CORS policy
3. Set up CloudFront CDN
4. Update environment variables
5. Test file uploads

**✅ Tasks:**
- [ ] Create uploads directory OR configure S3
- [ ] Test image upload
- [ ] Test digital asset upload
- [ ] Verify file access permissions
- [ ] Set up CDN (optional but recommended)

---

### 5. Email Configuration (Optional)

#### SendGrid Setup
1. Create SendGrid account
2. Verify sender domain
3. Create API key
4. Configure templates (optional)

**✅ Tasks:**
- [ ] Create email service account
- [ ] Verify sender domain
- [ ] Configure API key
- [ ] Test email sending
- [ ] Create email templates for:
  - [ ] User registration
  - [ ] Password reset
  - [ ] Order confirmation
  - [ ] Vendor approval/rejection
  - [ ] Payout notifications

---

### 6. Security Checklist

**✅ Critical Security Tasks:**
- [ ] All secrets are strong and unique
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection enabled
- [ ] Password hashing (bcrypt, 12 rounds)
- [ ] JWT tokens properly secured
- [ ] Environment variables not committed to git
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Audit logs active

---

### 7. Build & Deploy

#### Backend Build
```bash
cd backend
npm install --production
npm run build
npx prisma generate
```

#### Frontend Build
```bash
cd frontend
npm install --production
npm run build
```

**✅ Deployment Tasks:**
- [ ] Build backend successfully
- [ ] Build frontend successfully
- [ ] Test production builds locally
- [ ] Deploy backend to server
- [ ] Deploy frontend to server
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure domain DNS

---

### 8. Production Hosting Options

#### Option 1: All-in-One (Railway/Heroku)
**Backend + Database:**
- Railway.app (Recommended)
- Heroku
- Render.com

**Frontend:**
- Vercel (Recommended)
- Netlify

**Cost:** ~$25-50/month

#### Option 2: Cloud Infrastructure (AWS/DigitalOcean)
**Components:**
- EC2/Droplet for backend
- RDS/Managed PostgreSQL
- ElastiCache/Managed Redis
- S3 for file storage
- CloudFront for CDN
- Vercel for frontend

**Cost:** ~$80-150/month

#### Option 3: VPS (DigitalOcean/Linode)
**Single Server:**
- Docker Compose deployment
- PostgreSQL container
- Redis container
- Backend container
- Nginx reverse proxy
- Frontend deployment to Vercel

**Cost:** ~$20-40/month

**✅ Hosting Tasks:**
- [ ] Choose hosting provider
- [ ] Set up server/service
- [ ] Configure database
- [ ] Configure Redis
- [ ] Deploy applications
- [ ] Set up monitoring

---

### 9. Testing Checklist

#### Critical User Flows
**✅ Customer Flow:**
- [ ] Register new account
- [ ] Login successfully
- [ ] Browse products
- [ ] View product details
- [ ] Add to cart
- [ ] Proceed to checkout
- [ ] Complete Stripe payment
- [ ] View order confirmation
- [ ] Submit product review

**✅ Vendor Flow:**
- [ ] Register as vendor
- [ ] Wait for admin approval
- [ ] Access vendor dashboard
- [ ] View statistics
- [ ] Check orders
- [ ] View earnings
- [ ] Request payout

**✅ Admin Flow:**
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Approve pending vendor
- [ ] Manage users
- [ ] View all orders
- [ ] Check platform analytics

**✅ Technical Tests:**
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] RBAC permissions enforced
- [ ] File uploads work
- [ ] Payments process correctly
- [ ] Webhooks received
- [ ] Reviews display correctly
- [ ] Error handling works

---

### 10. Monitoring & Logging

**✅ Set Up Monitoring:**
- [ ] Error tracking (Sentry recommended)
- [ ] Application monitoring (New Relic/DataDog)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (Papertrail/Loggly)
- [ ] Database monitoring
- [ ] Payment monitoring (Stripe Dashboard)

---

### 11. Performance Optimization

**✅ Optimization Tasks:**
- [ ] Enable Redis caching
- [ ] Database query optimization
- [ ] Image optimization (CDN)
- [ ] Gzip compression enabled
- [ ] Static asset caching
- [ ] Database connection pooling
- [ ] Rate limiting configured
- [ ] API response caching

---

### 12. Documentation

**✅ Documentation Tasks:**
- [ ] API documentation complete
- [ ] User guide created
- [ ] Vendor onboarding guide
- [ ] Admin manual
- [ ] Technical documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

### 13. Legal & Compliance

**✅ Legal Requirements:**
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] Vendor Agreement
- [ ] Refund Policy
- [ ] GDPR compliance (if EU users)
- [ ] PCI DSS compliance (Stripe handles)
- [ ] Data retention policy

---

### 14. Launch Preparation

**✅ Pre-Launch:**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance tested
- [ ] Backup system verified
- [ ] Monitoring active
- [ ] Support email configured
- [ ] Social media accounts created
- [ ] Marketing materials ready

**✅ Launch Day:**
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Test critical flows
- [ ] Monitor error logs
- [ ] Check payment processing
- [ ] Announce launch

**✅ Post-Launch:**
- [ ] Monitor for 24 hours
- [ ] Fix any critical bugs
- [ ] Collect user feedback
- [ ] Monitor performance metrics
- [ ] Check payment transactions
- [ ] Review error logs daily

---

## 🚀 DEPLOYMENT COMMANDS

### Quick Deploy (Docker Compose)
```bash
# Clone repository
git clone <your-repo-url>
cd kalavpp

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit .env files with production values

# Start with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Check logs
docker-compose logs -f
```

### Manual Deploy

#### Backend
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm install --production
npm run build
npm start
```

---

## 📊 POST-DEPLOYMENT MONITORING

### Key Metrics to Watch
- **Uptime**: Target 99.9%
- **Response Time**: < 500ms average
- **Error Rate**: < 0.1%
- **Payment Success Rate**: > 95%
- **User Registrations**: Track daily
- **Order Volume**: Track daily
- **Revenue**: Monitor real-time

### Daily Checks
- [ ] Check error logs
- [ ] Review payment transactions
- [ ] Monitor server resources
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Check uptime status

---

## 🆘 TROUBLESHOOTING

### Common Issues

**Database Connection Failed**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Stripe Webhook Not Working**
- Verify webhook URL is accessible
- Check webhook secret matches
- Review Stripe Dashboard logs
- Test with Stripe CLI

**File Upload Errors**
- Check uploads directory permissions
- Verify S3 credentials (if using)
- Check file size limits
- Review CORS configuration

**Payment Processing Issues**
- Verify Stripe keys are live mode
- Check webhook events
- Review Stripe Dashboard
- Test with test card first

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Stripe configured and tested
- [ ] File uploads working
- [ ] Email service configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Legal pages in place
- [ ] Support email active

**🎉 You're ready to launch!**

---

*Last Updated: February 8, 2026*  
*Version: 1.0*  
*Status: Production Ready*
