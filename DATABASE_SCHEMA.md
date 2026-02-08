# KALAVPP - Database Schema Design

## Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│      USERS       │
├──────────────────┤
│ id (PK)          │
│ email            │
│ password_hash    │
│ role             │◄──────────┐
│ status           │            │
│ first_name       │            │
│ last_name        │            │
│ avatar_url       │            │
│ created_at       │            │
│ updated_at       │            │
└────────┬─────────┘            │
         │                      │
         │ 1:1                  │
         │                      │
┌────────▼─────────┐            │
│ VENDOR_PROFILES  │            │
├──────────────────┤            │
│ id (PK)          │            │
│ user_id (FK)     │            │
│ business_name    │            │
│ description      │            │
│ commission_rate  │            │
│ approval_status  │            │
│ approved_by      │────────────┘
│ approved_at      │
│ tax_id           │
│ payout_email     │
│ created_at       │
└────────┬─────────┘
         │
         │ 1:N
         │
┌────────▼─────────┐
│    PRODUCTS      │
├──────────────────┤
│ id (PK)          │
│ vendor_id (FK)   │
│ title            │
│ description      │
│ category         │
│ type             │──────────┐ (physical/digital)
│ price            │          │
│ stock_quantity   │          │
│ is_digital       │          │
│ status           │          │
│ created_at       │          │
│ updated_at       │          │
└────────┬─────────┘          │
         │                    │
         │ 1:N                │ 1:N
         │                    │
┌────────▼─────────┐  ┌───────▼──────────┐
│ PRODUCT_IMAGES   │  │ DIGITAL_ASSETS   │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ product_id (FK)  │  │ product_id (FK)  │
│ url              │  │ file_url         │
│ alt_text         │  │ file_size        │
│ display_order    │  │ file_type        │
│ created_at       │  │ download_limit   │
└──────────────────┘  │ created_at       │
                      └───────┬──────────┘
                              │
                              │ 1:N
                              │
                      ┌───────▼──────────┐
                      │ DOWNLOAD_LOGS    │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ asset_id (FK)    │
                      │ user_id (FK)     │
                      │ order_id (FK)    │
                      │ downloaded_at    │
                      │ ip_address       │
                      └──────────────────┘


┌──────────────────┐
│    SERVICES      │
├──────────────────┤
│ id (PK)          │
│ vendor_id (FK)   │
│ title            │
│ description      │
│ category         │
│ service_type     │──────────┐ (commission/workshop/course)
│ price            │          │
│ duration         │          │
│ delivery_time    │          │
│ status           │          │
│ created_at       │          │
│ updated_at       │          │
└────────┬─────────┘          │
         │                    │
         │ 1:N                │
         │                    │
┌────────▼─────────┐          │
│ SERVICE_IMAGES   │          │
├──────────────────┤          │
│ id (PK)          │          │
│ service_id (FK)  │          │
│ url              │          │
│ alt_text         │          │
│ display_order    │          │
│ created_at       │          │
└──────────────────┘          │
                              │
                              │
┌─────────────────────────────┘
│
│     ORDERS SYSTEM
│
└──────────┐
           │
   ┌───────▼─────────┐
   │     ORDERS      │
   ├─────────────────┤
   │ id (PK)         │
   │ user_id (FK)    │
   │ order_number    │
   │ total_amount    │
   │ status          │──────┐ (pending/processing/completed/cancelled)
   │ payment_status  │      │
   │ created_at      │      │
   │ updated_at      │      │
   └────────┬────────┘      │
            │               │
            │ 1:N           │
            │               │
   ┌────────▼────────┐      │
   │  ORDER_ITEMS    │      │
   ├─────────────────┤      │
   │ id (PK)         │      │
   │ order_id (FK)   │      │
   │ product_id (FK) │      │
   │ service_id (FK) │      │
   │ vendor_id (FK)  │      │
   │ quantity        │      │
   │ unit_price      │      │
   │ subtotal        │      │
   │ commission_rate │      │
   │ commission_amt  │      │
   │ created_at      │      │
   └─────────────────┘      │
                            │
                            │
   ┌────────────────────────┘
   │
   │ 1:1
   │
   ┌▼──────────────────┐
   │     PAYMENTS      │
   ├───────────────────┤
   │ id (PK)           │
   │ order_id (FK)     │
   │ stripe_payment_id │
   │ amount            │
   │ currency          │
   │ payment_method    │
   │ status            │
   │ paid_at           │
   │ created_at        │
   └───────────────────┘


   ┌──────────────────┐
   │    INVOICES      │
   ├──────────────────┤
   │ id (PK)          │
   │ order_id (FK)    │
   │ invoice_number   │
   │ invoice_url      │
   │ generated_at     │
   │ created_at       │
   └──────────────────┘


   ┌──────────────────┐
   │   COMMISSIONS    │
   ├──────────────────┤
   │ id (PK)          │
   │ order_item_id(FK)│
   │ vendor_id (FK)   │
   │ order_id (FK)    │
   │ commission_rate  │
   │ commission_amt   │
   │ platform_fee     │
   │ vendor_earnings  │
   │ status           │──────┐ (pending/paid/held)
   │ paid_at          │      │
   │ created_at       │      │
   └──────────────────┘      │
                             │
                             │
   ┌─────────────────────────┘
   │
   │ N:1
   │
   ┌▼──────────────────┐
   │ VENDOR_PAYOUTS    │
   ├───────────────────┤
   │ id (PK)           │
   │ vendor_id (FK)    │
   │ amount            │
   │ payout_method     │
   │ status            │
   │ stripe_payout_id  │
   │ processed_at      │
   │ created_at        │
   └───────────────────┘


   ┌──────────────────┐
   │     REVIEWS      │
   ├──────────────────┤
   │ id (PK)          │
   │ user_id (FK)     │
   │ product_id (FK)  │
   │ service_id (FK)  │
   │ order_id (FK)    │
   │ rating           │
   │ comment          │
   │ status           │
   │ created_at       │
   │ updated_at       │
   └──────────────────┘


   ┌──────────────────┐
   │   CATEGORIES     │
   ├──────────────────┤
   │ id (PK)          │
   │ name             │
   │ slug             │
   │ type             │──────┐ (product/service)
   │ parent_id (FK)   │      │
   │ description      │      │
   │ image_url        │      │
   │ display_order    │      │
   │ is_active        │      │
   │ created_at       │      │
   └──────────────────┘      │
                             │
                             │
   ┌─────────────────────────┘
   │
   │  CART SYSTEM (Redis/PostgreSQL)
   │
   └──────────┐
              │
      ┌───────▼─────────┐
      │   CART_ITEMS    │
      ├─────────────────┤
      │ id (PK)         │
      │ user_id (FK)    │
      │ session_id      │
      │ product_id (FK) │
      │ service_id (FK) │
      │ quantity        │
      │ created_at      │
      │ expires_at      │
      └─────────────────┘
```

## PostgreSQL Table Definitions

### 1. Users Table
```sql
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### 2. Vendor Profiles Table
```sql
CREATE TYPE vendor_approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    bio TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    approval_status vendor_approval_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    business_address JSONB,
    tax_id VARCHAR(50),
    payout_email VARCHAR(255),
    stripe_account_id VARCHAR(255),
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX idx_vendor_profiles_approval_status ON vendor_profiles(approval_status);
```

### 3. Categories Table
```sql
CREATE TYPE category_type AS ENUM ('product', 'service');

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type category_type NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

### 4. Products Table
```sql
CREATE TYPE product_type AS ENUM ('physical', 'digital', 'both');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    type product_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100),
    is_digital BOOLEAN DEFAULT FALSE,
    status product_status DEFAULT 'draft',
    tags TEXT[],
    metadata JSONB,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

### 5. Product Images Table
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
```

### 6. Digital Assets Table
```sql
CREATE TABLE digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    download_limit INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_digital_assets_product_id ON digital_assets(product_id);
```

### 7. Download Logs Table
```sql
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_download_logs_asset_id ON download_logs(asset_id);
CREATE INDEX idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX idx_download_logs_order_id ON download_logs(order_id);
```

### 8. Services Table
```sql
CREATE TYPE service_type AS ENUM ('commission', 'workshop', 'course', 'consultation');
CREATE TYPE service_status AS ENUM ('draft', 'active', 'inactive', 'sold_out');

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    service_type service_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER,
    delivery_time VARCHAR(50),
    capacity INTEGER,
    status service_status DEFAULT 'draft',
    requirements TEXT,
    tags TEXT[],
    metadata JSONB,
    views_count INTEGER DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_vendor_id ON services(vendor_id);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_status ON services(status);
```

### 9. Service Images Table
```sql
CREATE TABLE service_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_images_service_id ON service_images(service_id);
```

---

**Continued in next file for Orders, Payments, Reviews, etc.**
