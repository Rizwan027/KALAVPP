# KALAVPP Backend API

Production-ready backend API for KALAVPP - ArtCommerce & Creative Services Platform.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **Storage**: AWS S3 / Cloudinary

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client setup
│   │   └── redis.ts     # Redis client setup
│   ├── controllers/     # Request handlers
│   │   └── auth.controller.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── authenticate.ts    # JWT authentication
│   │   ├── authorize.ts       # RBAC middleware
│   │   ├── errorHandler.ts    # Global error handler
│   │   ├── validate.ts        # Validation middleware
│   │   └── rateLimiter.ts     # Rate limiting
│   ├── services/        # Business logic layer
│   │   └── auth.service.ts
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   ├── service.routes.ts
│   │   ├── order.routes.ts
│   │   ├── vendor.routes.ts
│   │   ├── admin.routes.ts
│   │   └── category.routes.ts
│   ├── validators/      # Request validation schemas
│   │   └── auth.validator.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── server.ts        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── logs/                # Application logs
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
└── README.md

```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed database (optional)
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.kalavpp.com/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### Role-Based Access Control (RBAC)

The API uses three user roles:

- **customer**: Can browse and purchase products/services
- **vendor**: Can create and manage their own products/services
- **admin**: Full platform access

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

### Success Responses

All success responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Database Schema

See `DATABASE_SCHEMA.md` for complete database documentation.

## Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Rate limiting (100 requests/15min)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ Input validation
- ✅ HTTPS enforcement (production)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## Logging

Logs are stored in the `logs/` directory:
- `error.log`: Error-level logs only
- `combined.log`: All logs

## Environment Variables

See `.env.example` for all required environment variables.

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linting and tests
5. Submit pull request

## License

MIT
