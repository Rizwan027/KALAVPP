# KALAVPP - System Architecture Documentation

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐          ┌──────────────────────┐        │
│  │   Web Application    │          │  Flutter Mobile App  │        │
│  │   (Next.js + React)  │          │   (Future Android    │        │
│  │                      │          │    & iOS)            │        │
│  └──────────┬───────────┘          └──────────┬───────────┘        │
│             │                                  │                     │
│             └──────────────┬───────────────────┘                     │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ HTTPS / REST API
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            │         API GATEWAY LAYER               │
├────────────────────────────┼─────────────────────────────────────────┤
│                            ▼                                         │
│              ┌──────────────────────────┐                           │
│              │   Nginx / Load Balancer  │                           │
│              │   - Rate Limiting        │                           │
│              │   - SSL Termination      │                           │
│              │   - Request Routing      │                           │
│              └─────────────┬────────────┘                           │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            │      APPLICATION LAYER                  │
├────────────────────────────┼─────────────────────────────────────────┤
│                            ▼                                         │
│         ┌─────────────────────────────────────┐                     │
│         │   Node.js + Express Backend         │                     │
│         │   (RESTful API)                     │                     │
│         ├─────────────────────────────────────┤                     │
│         │                                     │                     │
│         │  ┌──────────────────────────────┐  │                     │
│         │  │  Authentication Service      │  │                     │
│         │  │  - JWT Token Management      │  │                     │
│         │  │  - OAuth2 Integration        │  │                     │
│         │  │  - Password Hashing (bcrypt) │  │                     │
│         │  └──────────────────────────────┘  │                     │
│         │                                     │                     │
│         │  ┌──────────────────────────────┐  │                     │
│         │  │  RBAC Middleware             │  │                     │
│         │  │  - Role Verification         │  │                     │
│         │  │  - Permission Checks         │  │                     │
│         │  └──────────────────────────────┘  │                     │
│         │                                     │                     │
│         │  ┌──────────────────────────────┐  │                     │
│         │  │  Business Logic Layer        │  │                     │
│         │  │  - User Management           │  │                     │
│         │  │  - Product/Service Catalog   │  │                     │
│         │  │  - Order Processing          │  │                     │
│         │  │  - Commission Calculation    │  │                     │
│         │  │  - Vendor Approval Workflow  │  │                     │
│         │  └──────────────────────────────┘  │                     │
│         │                                     │                     │
│         │  ┌──────────────────────────────┐  │                     │
│         │  │  Payment Service             │  │                     │
│         │  │  - Stripe Integration        │  │                     │
│         │  │  - Invoice Generation        │  │                     │
│         │  │  - Refund Processing         │  │                     │
│         │  └──────────────────────────────┘  │                     │
│         │                                     │                     │
│         │  ┌──────────────────────────────┐  │                     │
│         │  │  Digital Asset Service       │  │                     │
│         │  │  - Signed URL Generation     │  │                     │
│         │  │  - Access Token Management   │  │                     │
│         │  │  - Download Tracking         │  │                     │
│         │  └──────────────────────────────┘  │                     │
│         │                                     │                     │
│         └─────────────────────────────────────┘                     │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            │        DATA LAYER                       │
├────────────────────────────┼─────────────────────────────────────────┤
│                            ▼                                         │
│    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│    │  PostgreSQL  │   │    Redis     │   │     S3 /     │         │
│    │   Database   │   │    Cache     │   │  Object      │         │
│    │              │   │              │   │  Storage     │         │
│    │ - Users      │   │ - Sessions   │   │              │         │
│    │ - Products   │   │ - Cart Data  │   │ - Images     │         │
│    │ - Orders     │   │ - API Cache  │   │ - Digital    │         │
│    │ - Payments   │   │              │   │   Assets     │         │
│    └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Stripe     │  │  SendGrid /  │  │   Cloudinary │             │
│  │   Payment    │  │   Email      │  │   CDN        │             │
│  │   Gateway    │  │   Service    │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## 2. TECHNOLOGY STACK JUSTIFICATION

### Frontend: React + Next.js 14 (App Router)

**Why Next.js?**
- ✅ **Server-Side Rendering (SSR)**: Critical for SEO in an e-commerce platform
- ✅ **Static Site Generation (SSG)**: Fast page loads for product listings
- ✅ **API Routes**: Built-in backend-for-frontend capabilities
- ✅ **File-based Routing**: Intuitive and scalable
- ✅ **Image Optimization**: Automatic optimization for art gallery displays
- ✅ **Code Splitting**: Automatic optimization for performance
- ✅ **TypeScript Support**: Type safety across the stack
- ✅ **Production Ready**: Used by Vercel, Netflix, Nike

**Additional Frontend Libraries:**
- **Tailwind CSS**: Utility-first CSS, rapid UI development, mobile-first
- **Redux Toolkit**: Predictable state management for cart, user session
- **React Query**: Server state management and caching
- **Formik + Yup**: Form handling and validation
- **Recharts**: Analytics dashboards
- **Framer Motion**: Smooth animations for better UX

### Backend: Node.js + Express.js

**Why Node.js + Express?**
- ✅ **JavaScript Everywhere**: Same language for frontend and backend
- ✅ **High Performance**: Event-driven, non-blocking I/O ideal for I/O-heavy operations
- ✅ **Rich Ecosystem**: npm has packages for everything (payments, auth, file handling)
- ✅ **Scalability**: Handles concurrent connections efficiently
- ✅ **Microservices Ready**: Easy to split into microservices later
- ✅ **Flutter Compatible**: REST APIs work seamlessly with Flutter
- ✅ **Industry Standard**: Used by PayPal, Netflix, LinkedIn

**Backend Stack:**
- **Express.js**: Minimal, flexible web framework
- **TypeScript**: Type safety and better developer experience
- **Prisma ORM**: Type-safe database access, migrations
- **JWT (jsonwebtoken)**: Stateless authentication
- **Bcrypt**: Secure password hashing
- **Multer**: File upload handling
- **Express-validator**: Request validation
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate-limiter**: API rate limiting

### Database: PostgreSQL

**Why PostgreSQL?**
- ✅ **ACID Compliance**: Critical for financial transactions
- ✅ **Complex Queries**: Advanced JOIN operations for multi-vendor data
- ✅ **JSON Support**: Flexible schema for product attributes
- ✅ **Full-Text Search**: Search products and services
- ✅ **Scalability**: Handles millions of rows efficiently
- ✅ **Row-Level Security**: Fine-grained access control
- ✅ **Triggers & Functions**: Business logic enforcement
- ✅ **Industry Standard**: Used by Instagram, Spotify, Reddit

### Caching: Redis

**Why Redis?**
- ✅ **Session Storage**: Fast session management
- ✅ **Cart Data**: Temporary cart storage before checkout
- ✅ **API Caching**: Reduce database load
- ✅ **Rate Limiting**: Track API request counts
- ✅ **Real-time Features**: Pub/Sub for notifications (future)

### File Storage: AWS S3 / Cloudinary

**Why S3/Cloudinary?**
- ✅ **Scalable Storage**: Unlimited storage for digital assets
- ✅ **CDN Integration**: Fast global delivery
- ✅ **Signed URLs**: Secure digital download protection
- ✅ **Image Transformations**: Automatic resizing, optimization
- ✅ **Cost-Effective**: Pay per use

### Payment Gateway: Stripe

**Why Stripe?**
- ✅ **Complete Solution**: Payments, payouts, subscriptions
- ✅ **Security**: PCI DSS compliant
- ✅ **Developer-Friendly**: Excellent API and documentation
- ✅ **Multi-vendor Support**: Stripe Connect for marketplace
- ✅ **Global Support**: Multiple currencies and payment methods
- ✅ **Webhook Support**: Real-time payment notifications

## 3. DESIGN PRINCIPLES

### API-First Design
- RESTful API that can serve both web and mobile clients
- Consistent response formats
- Comprehensive error handling
- API versioning (/api/v1/...)

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Repositories**: Data access layer
- **Middleware**: Cross-cutting concerns (auth, logging, validation)

### Security First
- JWT-based authentication
- RBAC for all endpoints
- SQL injection protection (Prisma ORM)
- XSS protection (input sanitization)
- CSRF protection
- Rate limiting
- Secure headers (Helmet)
- Encrypted sensitive data

### Scalability Considerations
- Stateless backend (horizontal scaling)
- Database connection pooling
- Redis caching layer
- CDN for static assets
- Asynchronous processing for heavy operations
- Database indexing strategy

### Mobile-Ready Backend
- JSON responses optimized for mobile
- Pagination for all list endpoints
- Efficient image delivery (multiple sizes)
- Offline-first considerations (conflict resolution)
- Same authentication flow for mobile

## 4. DATA FLOW EXAMPLES

### User Authentication Flow
```
1. User enters credentials → Frontend
2. POST /api/v1/auth/login → Backend
3. Validate credentials → Database
4. Generate JWT token → Backend
5. Return token + user data → Frontend
6. Store token in localStorage/secure storage → Client
7. Include token in Authorization header for subsequent requests
```

### Product Purchase Flow
```
1. Browse products → Frontend (SSR/SSG)
2. Add to cart → Redux State + Redis Cache
3. Checkout → POST /api/v1/orders
4. Process payment → Stripe API
5. Create order → PostgreSQL (Transaction)
6. Calculate commission → Commission Service
7. Send confirmation email → SendGrid
8. Generate invoice → Invoice Service
9. If digital: Generate signed download URL → S3 Service
10. Return order details → Frontend
```

### Vendor Approval Flow
```
1. User registers as vendor → POST /api/v1/auth/register
2. User status = 'pending_approval'
3. Admin views pending vendors → GET /api/v1/admin/vendors/pending
4. Admin approves → PUT /api/v1/admin/vendors/:id/approve
5. Update user role to 'vendor' → Database
6. Send approval email → Email Service
7. Vendor can now create listings
```

## 5. SECURITY ARCHITECTURE

### Authentication & Authorization
- **JWT Tokens**: Short-lived access tokens (15 min) + refresh tokens (7 days)
- **Password Security**: Bcrypt with salt rounds = 12
- **OAuth2**: Google, Facebook login integration
- **Role-Based Access Control**: Admin, Vendor, Customer roles
- **Permission Middleware**: Route-level permission checks

### Data Protection
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Sensitive Data**: Encrypted payment info, hashed passwords
- **PII Protection**: GDPR-compliant data handling

### API Security
- **Rate Limiting**: 100 requests/15min per IP
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection**: Prevented by Prisma ORM
- **XSS Protection**: Output escaping, CSP headers
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Helmet.js**: Security headers

### Digital Asset Protection
- **Signed URLs**: Temporary, expiring download links
- **Access Tokens**: Verify purchase before download
- **Watermarking**: Optional watermark for previews
- **Download Limits**: Track and limit downloads per purchase
- **IP Tracking**: Monitor suspicious download patterns

## 6. SCALABILITY STRATEGY

### Horizontal Scaling
- **Stateless Backend**: Any server can handle any request
- **Load Balancing**: Nginx reverse proxy
- **Database Connection Pooling**: Prisma connection pool
- **Session in Redis**: Shared session storage

### Performance Optimization
- **CDN**: Static assets served via CDN
- **Database Indexing**: Critical queries optimized
- **Query Optimization**: N+1 query prevention
- **Lazy Loading**: Frontend lazy component loading
- **Image Optimization**: Next.js Image component
- **API Response Caching**: Redis caching layer

### Future Microservices Path
When needed, services can be extracted:
- Auth Service
- Payment Service
- Digital Asset Service
- Notification Service
- Analytics Service

## 7. MONITORING & LOGGING

### Application Monitoring
- **Winston**: Structured logging
- **Morgan**: HTTP request logging
- **Sentry**: Error tracking and monitoring
- **Prometheus**: Metrics collection

### Business Metrics
- **Orders per minute**
- **Revenue tracking**
- **Vendor performance**
- **Popular products/services**
- **User engagement**

## 8. DEPLOYMENT ARCHITECTURE

### Production Environment
```
┌─────────────────────────────────────────────┐
│           CloudFlare CDN                    │
│           (SSL, DDoS Protection)            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Nginx Load Balancer                 │
│         (Rate Limiting, SSL)                │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│   Next.js      │  │   Next.js      │
│   Instance 1   │  │   Instance 2   │
│   (Frontend)   │  │   (Frontend)   │
└───────┬────────┘  └───────┬────────┘
        │                   │
        └─────────┬─────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Backend API Load Balancer           │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│   Express      │  │   Express      │
│   Instance 1   │  │   Instance 2   │
└───────┬────────┘  └───────┬────────┘
        │                   │
        └─────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌────▼───┐   ┌────▼────┐
│ PostgreSQL  Redis    │   S3        │
│ (Primary)   Cache    │   Storage   │
└─────────┘   └────────┘   └─────────┘
```

### Hosting Recommendations
- **Frontend**: Vercel (Next.js optimized) or AWS Amplify
- **Backend**: AWS EC2 / DigitalOcean / Railway
- **Database**: AWS RDS PostgreSQL / DigitalOcean Managed DB
- **Cache**: AWS ElastiCache Redis / DigitalOcean Redis
- **Storage**: AWS S3 / Cloudinary
- **CDN**: CloudFlare / AWS CloudFront

## 9. FLUTTER MOBILE APP COMPATIBILITY

### API Design for Mobile
✅ All endpoints return JSON
✅ Consistent error response format
✅ JWT authentication (works with flutter_secure_storage)
✅ Pagination support for all lists
✅ Image URLs with multiple sizes
✅ Efficient data transfer (minimal payload)

### Mobile-Specific Considerations
- **Offline Support**: API designed for eventual consistency
- **Image Sizes**: Multiple resolutions for different devices
- **Push Notifications**: Backend ready for FCM integration
- **Deep Linking**: Order/product URL structure supports deep links
- **Conflict Resolution**: Timestamp-based conflict handling

### Shared Authentication Flow
```dart
// Flutter can use the same JWT flow
final response = await http.post(
  Uri.parse('$API_URL/api/v1/auth/login'),
  body: {'email': email, 'password': password}
);
final token = jsonDecode(response.body)['token'];
await storage.write(key: 'jwt_token', value: token);
```

## 10. CI/CD PIPELINE

### Development Workflow
```
Code Push → GitHub
    ↓
GitHub Actions Triggered
    ↓
Run Tests (Jest + Cypress)
    ↓
Build Frontend (Next.js)
    ↓
Build Backend (TypeScript)
    ↓
Run Linting (ESLint + Prettier)
    ↓
Security Scan (Snyk)
    ↓
Deploy to Staging
    ↓
Run E2E Tests
    ↓
Manual Approval
    ↓
Deploy to Production
```

### Environment Configuration
- **Development**: Local database, mock payment
- **Staging**: Staging database, Stripe test mode
- **Production**: Production database, Stripe live mode

---

**Next Steps**: Implement the complete folder structure and codebase based on this architecture.
