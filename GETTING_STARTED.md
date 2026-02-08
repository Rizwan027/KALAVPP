# Getting Started with KALAVPP

Complete guide to set up and run the KALAVPP platform locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Setup](#docker-setup)
4. [Project Structure Overview](#project-structure-overview)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: 6.x or higher ([Download](https://redis.io/download))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### Optional (Recommended)
- **Docker Desktop**: For containerized development ([Download](https://www.docker.com/products/docker-desktop))
- **VS Code**: With recommended extensions ([Download](https://code.visualstudio.com/))
  - ESLint
  - Prettier
  - Prisma
  - TypeScript

### Accounts You'll Need
- **Stripe**: For payment processing ([Sign up](https://stripe.com))
- **AWS/Cloudinary**: For file storage (optional for local dev)
- **SendGrid**: For email (optional for local dev)

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/kalavpp.git
cd kalavpp
```

### Step 2: Setup PostgreSQL Database

**Option A: Using PostgreSQL Locally**
```bash
# Create database
createdb kalavpp_db

# Create user (optional)
psql -c "CREATE USER kalavpp WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE kalavpp_db TO kalavpp;"
```

**Option B: Using Docker**
```bash
docker run --name kalavpp-postgres \
  -e POSTGRES_USER=kalavpp \
  -e POSTGRES_PASSWORD=kalavpp_dev \
  -e POSTGRES_DB=kalavpp_db \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Step 3: Setup Redis

**Option A: Using Redis Locally**
```bash
# MacOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

**Option B: Using Docker**
```bash
docker run --name kalavpp-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

### Step 4: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://kalavpp:kalavpp_dev@localhost:5432/kalavpp_db
# REDIS_HOST=localhost
# JWT_SECRET=your-development-secret
# ... etc

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

The backend API will be available at **http://localhost:5000**

### Step 5: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
# NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

### Step 6: Verify Installation

1. **Check Backend Health**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"success","message":"KALAVPP API is running",...}`

2. **Check Frontend**
   - Open browser to http://localhost:3000
   - You should see the KALAVPP home page

3. **Test Registration**
   - Go to http://localhost:3000/register
   - Create a test account
   - Verify you can log in

## Docker Setup

The easiest way to run the entire stack:

### Step 1: Install Docker Desktop

Download and install from [docker.com](https://www.docker.com/products/docker-desktop)

### Step 2: Start All Services

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Services Running
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Step 3: Run Migrations in Docker

```bash
# Run migrations
docker-compose exec backend npm run prisma:migrate

# Seed database
docker-compose exec backend npm run prisma:seed
```

## Project Structure Overview

```
kalavpp/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database, Redis configs
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Auth, validation, errors
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   ├── validators/        # Input validation
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend web app
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Register page
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Header, Footer
│   │   │   └── home/          # Home page sections
│   │   ├── lib/               # API client, utilities
│   │   ├── store/             # Redux store
│   │   └── styles/            # Global styles
│   ├── .env.local             # Environment variables
│   ├── package.json
│   └── next.config.js
│
├── docs/                       # Documentation
├── docker-compose.yml          # Docker configuration
├── .gitignore
└── README.md
```

## Common Tasks

### Create a New Database Migration

```bash
cd backend
npm run prisma:migrate
# Follow prompts to name your migration
```

### View Database with Prisma Studio

```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

### Add a New API Endpoint

1. **Create validator** (if needed)
   ```typescript
   // backend/src/validators/product.validator.ts
   export const createProductValidator = [
     body('title').notEmpty(),
     body('price').isNumeric(),
   ];
   ```

2. **Create service**
   ```typescript
   // backend/src/services/product.service.ts
   export class ProductService {
     static async createProduct(data) {
       return await prisma.product.create({ data });
     }
   }
   ```

3. **Create controller**
   ```typescript
   // backend/src/controllers/product.controller.ts
   export class ProductController {
     static async create(req, res, next) {
       const product = await ProductService.createProduct(req.body);
       return ApiResponse.created(res, product);
     }
   }
   ```

4. **Add route**
   ```typescript
   // backend/src/routes/product.routes.ts
   router.post('/', 
     authenticate, 
     isVendor,
     validate(createProductValidator),
     ProductController.create
   );
   ```

### Add a New Frontend Page

```bash
# Create new page directory
mkdir -p frontend/src/app/products

# Create page file
touch frontend/src/app/products/page.tsx
```

```tsx
// frontend/src/app/products/page.tsx
export default function ProductsPage() {
  return (
    <div className="container-custom py-16">
      <h1 className="section-title">Products</h1>
      {/* Your content */}
    </div>
  );
}
```

### Run Tests

```bash
# Backend tests
cd backend
npm test
npm run test:watch

# Frontend tests
cd frontend
npm test
```

### Lint and Format Code

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
# DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Fix**:
```bash
# Restart PostgreSQL
# MacOS
brew services restart postgresql

# Ubuntu
sudo systemctl restart postgresql

# Docker
docker restart kalavpp-postgres
```

### Redis Connection Issues

**Error**: "Redis connection failed"
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

**Fix**:
```bash
# Restart Redis
# MacOS
brew services restart redis

# Ubuntu
sudo systemctl restart redis

# Docker
docker restart kalavpp-redis
```

### Port Already in Use

**Error**: "Port 5000 is already in use"
```bash
# Find process using the port
# MacOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000

# Kill the process
kill -9 <PID>
```

**Alternative**: Change port in `.env`
```bash
PORT=5001
```

### Prisma Client Not Generated

**Error**: "Cannot find module '@prisma/client'"
```bash
cd backend
npm run prisma:generate
```

### Migration Failed

**Error**: "Migration failed to apply"
```bash
# Reset database (⚠️ deletes all data)
cd backend
npm run prisma:migrate reset

# Or manually drop and recreate
dropdb kalavpp_db
createdb kalavpp_db
npm run prisma:migrate
```

### Frontend Build Errors

**Error**: "Module not found" or type errors
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### CORS Errors

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix**: Update backend `.env`
```bash
CORS_ORIGIN=http://localhost:3000
```

### JWT Token Issues

**Error**: "Invalid token" or "Token expired"

**Fix**:
1. Clear browser localStorage
2. Log out and log in again
3. Verify JWT_SECRET is set in backend `.env`

## Environment Variables Reference

### Backend Required
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/kalavpp_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

### Frontend Required
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional (for full features)
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Email
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@kalavpp.com
```

## Default Test Accounts

After running seed:
```
Admin:
Email: admin@kalavpp.com
Password: Admin123!

Vendor:
Email: vendor@kalavpp.com
Password: Vendor123!

Customer:
Email: customer@kalavpp.com
Password: Customer123!
```

## Next Steps

1. **Explore the API**: http://localhost:5000/health
2. **Browse the frontend**: http://localhost:3000
3. **Check Prisma Studio**: http://localhost:5555
4. **Read documentation**: Check README.md and other docs
5. **Start building**: Add your features!

## Need Help?

- **Documentation**: Check `/docs` folder
- **GitHub Issues**: [Create an issue](https://github.com/your-org/kalavpp/issues)
- **Architecture**: See `ARCHITECTURE.md`
- **Database**: See `DATABASE_SCHEMA.md`
- **Deployment**: See `DEPLOYMENT.md`

Happy coding! 🚀
