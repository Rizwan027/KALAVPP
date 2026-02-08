# KALAVPP Deployment Guide

## 🚀 Deploying to Production

This guide will help you deploy your KALAVPP platform to production using **Vercel** (frontend) and **Railway/Render** (backend).

---

## 📦 Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd frontend
git init
git add .
git commit -m "Initial commit - India-localized KALAVPP"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/kalavpp-frontend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your GitHub repository** (kalavpp-frontend)
4. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (or `frontend` if you uploaded the whole project)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app/api/v1
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   ```

6. **Deploy!** Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., kalavpp.in)
4. Follow DNS configuration instructions

---

## 🔧 Backend Deployment (Railway or Render)

### Option A: Railway (Recommended)

#### Prerequisites
- GitHub account
- Railway account

#### Steps:

1. **Push backend code to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend - India-localized KALAVPP"
   git remote add origin https://github.com/YOUR_USERNAME/kalavpp-backend.git
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your backend repository
   - Railway will auto-detect Node.js

3. **Add Environment Variables in Railway:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   CORS_ORIGIN=https://your-app.vercel.app
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Setup PostgreSQL Database:**
   - In Railway, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide DATABASE_URL
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

5. **Get your backend URL:**
   - Railway will provide a URL like: `https://your-backend.railway.app`
   - Update frontend's `NEXT_PUBLIC_API_URL` in Vercel

---

### Option B: Render

1. **Go to [Render](https://render.com)**
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as Railway above)

5. **Create PostgreSQL Database:**
   - In Render dashboard, create new PostgreSQL database
   - Copy connection string to `DATABASE_URL`

---

## 🗄️ Database Setup (Production)

### Option 1: Railway PostgreSQL (Free tier available)
- Automatic setup with Railway deployment
- Good for getting started

### Option 2: Neon (Serverless PostgreSQL)
- Go to [Neon](https://neon.tech)
- Create free account
- Create new project
- Copy connection string
- Update `DATABASE_URL` in backend environment variables

### Option 3: Supabase
- Go to [Supabase](https://supabase.com)
- Create free project
- Get PostgreSQL connection string from project settings
- Update `DATABASE_URL`

### Run Migrations:
```bash
# Connect to your production database
npx prisma migrate deploy

# Seed initial data
npx ts-node prisma/seed.ts
```

---

## 🔐 Production Security Checklist

### Backend:
- [ ] Generate new JWT_SECRET (use: `openssl rand -base64 32`)
- [ ] Generate new JWT_REFRESH_SECRET
- [ ] Update CORS_ORIGIN to your Vercel URL
- [ ] Use production Stripe keys (sk_live_... and pk_live_...)
- [ ] Setup Stripe webhooks for production
- [ ] Configure environment variables (never commit .env files)
- [ ] Enable HTTPS only
- [ ] Setup database backups

### Frontend:
- [ ] Update NEXT_PUBLIC_API_URL to production backend
- [ ] Update NEXT_PUBLIC_SITE_URL to your domain
- [ ] Use production Stripe publishable key
- [ ] Test all features on production

---

## 📊 Post-Deployment Tasks

### 1. Test Production Environment
- [ ] Register a new user
- [ ] Login works
- [ ] Browse products
- [ ] Add to cart
- [ ] Complete checkout (test mode)
- [ ] Admin dashboard access
- [ ] Vendor dashboard access

### 2. Setup Monitoring
- Use Vercel Analytics for frontend
- Setup error tracking (Sentry)
- Monitor API performance

### 3. Configure Stripe for India
- Enable Indian payment methods (UPI, Cards, NetBanking)
- Setup webhooks at: `https://your-backend.railway.app/api/v1/webhooks/stripe`
- Test payments in test mode first

### 4. SEO & Performance
- Add meta tags
- Setup sitemap
- Configure robots.txt
- Optimize images
- Enable caching

---

## 🌐 Recommended Deployment Stack for India

**Frontend:** Vercel (Mumbai region - bom1)
**Backend:** Railway or Render
**Database:** Neon or Supabase (both have India regions)
**File Storage:** AWS S3 Mumbai region or Cloudinary
**CDN:** Cloudflare (India edge locations)

---

## 💰 Cost Estimate (Free tier options)

- **Vercel:** Free for personal/hobby projects
- **Railway:** $5/month (includes PostgreSQL)
- **Neon:** Free tier with 0.5GB storage
- **Render:** Free tier available (with limitations)

**Recommended starter:** Vercel (Free) + Railway ($5/month)

---

## 🆘 Troubleshooting

### Frontend doesn't connect to backend:
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS settings in backend
- Check browser console for errors

### Database connection fails:
- Verify DATABASE_URL format
- Check database is running
- Ensure IP whitelisting (if required)

### Stripe payments not working:
- Verify using production keys
- Check webhook configuration
- Test in Stripe test mode first

---

## 📞 Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- Render: https://render.com/docs

---

## 🎉 Success!

Once deployed, your KALAVPP platform will be live at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app

Share your platform with Indian artists and art lovers! 🇮🇳🎨
