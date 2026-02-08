# KALAVPP - Quick Start Guide

Get KALAVPP running in 5 minutes using Docker.

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed

## Setup (5 minutes)

### 1. Clone & Start (2 minutes)

```bash
# Clone repository
git clone https://github.com/your-org/kalavpp.git
cd kalavpp

# Start all services with Docker
docker-compose up -d
```

### 2. Initialize Database (2 minutes)

```bash
# Run migrations
docker-compose exec backend npm run prisma:migrate

# Seed with sample data (optional)
docker-compose exec backend npm run prisma:seed
```

### 3. Access Application (1 minute)

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Test It Out

### Register a New User
1. Go to http://localhost:3000/register
2. Fill in the form
3. Choose "Customer" or "Vendor"
4. Click "Create Account"

### Login
1. Go to http://localhost:3000/login
2. Use your credentials
3. You're in!

### Test Admin Access
Use seeded admin account:
- **Email**: admin@kalavpp.com
- **Password**: Admin123!

## What's Running?

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop everything
docker-compose down
```

## Next Steps

- **Full Setup Guide**: See `GETTING_STARTED.md`
- **Add Features**: See `README.md`
- **Deploy**: See `DEPLOYMENT.md`

That's it! You're ready to develop. 🎉
