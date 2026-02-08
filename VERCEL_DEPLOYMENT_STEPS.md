# 🚀 Quick Vercel Deployment Guide

## Step-by-Step Instructions to Deploy KALAVPP

---

## 🎯 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com/join)
2. **Vercel Account** - [Sign up here](https://vercel.com/signup)
3. **Your code ready** - Make sure your project is working locally

---

## 📁 Step 1: Push Frontend to GitHub

### Option A: Using Git Command Line

```bash
# Navigate to frontend folder
cd frontend

# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - KALAVPP Frontend"

# Go to GitHub.com and create a new repository named "kalavpp-frontend"
# Then run these commands with your GitHub username:

git remote add origin https://github.com/YOUR_USERNAME/kalavpp-frontend.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop (Easier)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. File → Add Local Repository → Select your `frontend` folder
4. Click "Publish repository"
5. Name it `kalavpp-frontend`
6. Click "Publish Repository"

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 2.2 Import Your Project

1. Click **"Add New..." → "Project"**
2. Find your `kalavpp-frontend` repository
3. Click **"Import"**

### 2.3 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build` (auto-filled)
**Output Directory:** `.next` (auto-filled)
**Install Command:** `npm install` (auto-filled)

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api/v1` (temporary) |
| `NEXT_PUBLIC_SITE_URL` | Will be provided after deployment |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_your_key` (for now) |

> **Note:** We'll update these after deploying the backend

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://kalavpp-frontend.vercel.app`

---

## 🎉 Step 3: Your Frontend is Live!

Your frontend is now deployed! But it won't work fully yet because:
- The backend is still running locally
- We need to deploy the backend too

---

## 🔧 Next: Deploy Backend

### Quick Option: Railway (Easiest)

1. **Push backend to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend deployment"
   git remote add origin https://github.com/YOUR_USERNAME/kalavpp-backend.git
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to [https://railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `kalavpp-backend`
   - Railway auto-deploys!

3. **Add Database:**
   - In Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Done! DATABASE_URL is auto-configured

4. **Add Environment Variables:**
   In Railway, go to your service → Variables tab:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-here
   JWT_REFRESH_SECRET=your-refresh-secret
   CORS_ORIGIN=https://kalavpp-frontend.vercel.app
   STRIPE_SECRET_KEY=sk_test_your_key
   ```

5. **Get your backend URL:**
   - Railway provides a URL like: `https://kalavpp-backend.railway.app`

6. **Update Vercel Environment Variables:**
   - Go back to Vercel
   - Go to your project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to: `https://kalavpp-backend.railway.app/api/v1`
   - Click "Redeploy" to apply changes

---

## ✅ Step 4: Test Your Production Site

1. Visit your Vercel URL: `https://kalavpp-frontend.vercel.app`
2. Try to:
   - Browse products
   - Register an account
   - Login
   - Add items to cart

---

## 🎨 Step 5: Add Custom Domain (Optional)

### In Vercel:

1. Go to your project → Settings → Domains
2. Add your domain (e.g., `kalavpp.in`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

### Update Environment Variables:

After adding custom domain:
1. Update `NEXT_PUBLIC_SITE_URL` in Vercel
2. Update `CORS_ORIGIN` and `FRONTEND_URL` in Railway

---

## 🔐 Security Before Going Live

### Generate Secure Secrets:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Refresh Secret
openssl rand -base64 32
```

Update these in Railway environment variables.

### Switch to Production Stripe Keys:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your production keys:
   - `sk_live_...` (Secret key)
   - `pk_live_...` (Publishable key)
3. Update in Railway and Vercel

---

## 📊 Deployment Checklist

- [ ] Frontend pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data added
- [ ] Frontend can connect to backend
- [ ] Login works
- [ ] Products display
- [ ] Stripe keys updated (for production)
- [ ] Custom domain added (optional)

---

## 💰 Cost

**Free Tier:**
- Vercel: Free
- Railway: Free trial, then $5/month

**Total to start: $0-5/month**

---

## 🆘 Common Issues

### "Failed to fetch" error:
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings

### Database connection error:
- Verify `DATABASE_URL` in Railway
- Run migrations: `npx prisma migrate deploy`

### Products not showing:
- Run seed script in Railway
- Check backend logs

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs

---

## 🎉 Success!

Once everything is deployed:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

Your KALAVPP platform is now live for all of India! 🇮🇳🎨

**Share it with artists and start growing your marketplace!**
