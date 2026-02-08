# KALAVPP - Database Schema Part 2 (Orders, Payments, Commissions)

## Orders and Payment Tables

### 10. Orders Table
```sql
CREATE TYPE order_status AS ENUM (
    'pending', 
    'processing', 
    'shipped', 
    'delivered', 
    'completed', 
    'cancelled', 
    'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending', 
    'processing', 
    'paid', 
    'failed', 
    'refunded', 
    'partially_refunded'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    shipping_address JSONB,
    billing_address JSONB,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### 11. Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
    item_type VARCHAR(20) NOT NULL, -- 'product' or 'service'
    title VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
```

### 12. Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_method_details JSONB,
    status payment_status DEFAULT 'pending',
    failure_reason TEXT,
    receipt_url TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 13. Invoices Table
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_url TEXT,
    pdf_url TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

### 14. Commissions Table
```sql
CREATE TYPE commission_status AS ENUM ('pending', 'available', 'paid', 'held', 'reversed');

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sale_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    vendor_earnings DECIMAL(10,2) NOT NULL,
    status commission_status DEFAULT 'pending',
    available_at TIMESTAMP,
    paid_at TIMESTAMP,
    payout_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_vendor_id ON commissions(vendor_id);
CREATE INDEX idx_commissions_order_id ON commissions(order_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_available_at ON commissions(available_at);
```

### 15. Vendor Payouts Table
```sql
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');

CREATE TABLE vendor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payout_method VARCHAR(50),
    stripe_payout_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    status payout_status DEFAULT 'pending',
    failure_reason TEXT,
    commission_ids UUID[],
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_payouts_vendor_id ON vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_status ON vendor_payouts(status);
CREATE INDEX idx_vendor_payouts_created_at ON vendor_payouts(created_at DESC);
```

## Reviews and Ratings

### 16. Reviews Table
```sql
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    status review_status DEFAULT 'approved',
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_product_or_service CHECK (
        (product_id IS NOT NULL AND service_id IS NULL) OR 
        (product_id IS NULL AND service_id IS NOT NULL)
    )
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

### 17. Review Images Table
```sql
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);
```

## Shopping Cart

### 18. Cart Items Table
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    CONSTRAINT check_cart_product_or_service CHECK (
        (product_id IS NOT NULL AND service_id IS NULL) OR 
        (product_id IS NULL AND service_id IS NOT NULL)
    ),
    CONSTRAINT check_user_or_session CHECK (
        (user_id IS NOT NULL) OR (session_id IS NOT NULL)
    )
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX idx_cart_items_expires_at ON cart_items(expires_at);
```

## Notifications

### 19. Notifications Table
```sql
CREATE TYPE notification_type AS ENUM (
    'order_placed', 
    'order_shipped', 
    'order_delivered',
    'payment_received',
    'vendor_approved',
    'new_review',
    'payout_processed',
    'general'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## Authentication & Security

### 20. Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### 21. Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

### 22. Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## Database Functions and Triggers

### Update Updated_At Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Generate Order Number Function
```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
    new_order_number VARCHAR;
BEGIN
    new_order_number := 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;
```

### Generate Invoice Number Function
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    new_invoice_number VARCHAR;
BEGIN
    new_invoice_number := 'INV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
    RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE invoice_number_seq START 1;
```

### Update Product Rating Function
```sql
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE product_id = NEW.product_id AND status = 'approved'
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = NEW.product_id AND status = 'approved'
        )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.product_id IS NOT NULL AND NEW.status = 'approved')
EXECUTE FUNCTION update_product_rating();
```

### Update Service Rating Function
```sql
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE service_id = NEW.service_id AND status = 'approved'
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE service_id = NEW.service_id AND status = 'approved'
        )
    WHERE id = NEW.service_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.service_id IS NOT NULL AND NEW.status = 'approved')
EXECUTE FUNCTION update_service_rating();
```

### Calculate Commission Trigger
```sql
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
    NEW.commission_amount := NEW.subtotal * (NEW.commission_rate / 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_commission_trigger
BEFORE INSERT OR UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_commission();
```

## Performance Optimization Indexes

```sql
-- Full-text search for products
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Full-text search for services
CREATE INDEX idx_services_search ON services USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Composite indexes for common queries
CREATE INDEX idx_products_vendor_status ON products(vendor_id, status);
CREATE INDEX idx_services_vendor_status ON services(vendor_id, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_commissions_vendor_status ON commissions(vendor_id, status);

-- JSONB indexes for metadata queries
CREATE INDEX idx_products_metadata ON products USING gin(metadata);
CREATE INDEX idx_services_metadata ON services USING gin(metadata);
```

## Database Seeding Script (Initial Data)

```sql
-- Insert default admin user
INSERT INTO users (email, password_hash, role, status, first_name, last_name, email_verified)
VALUES ('admin@kalavpp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oe2kBdX.aK.q', 'admin', 'active', 'Admin', 'User', TRUE);

-- Insert default categories
INSERT INTO categories (name, slug, type, description, is_active) VALUES
('Paintings', 'paintings', 'product', 'Original paintings and prints', TRUE),
('Digital Art', 'digital-art', 'product', 'Digital artwork and downloads', TRUE),
('Sculptures', 'sculptures', 'product', '3D art and sculptures', TRUE),
('Photography', 'photography', 'product', 'Professional photography', TRUE),
('Custom Commissions', 'custom-commissions', 'service', 'Custom art commissions', TRUE),
('Art Workshops', 'art-workshops', 'service', 'Educational art workshops', TRUE),
('Online Courses', 'online-courses', 'service', 'Online art courses', TRUE),
('Consultations', 'consultations', 'service', 'Professional art consultations', TRUE);
```

---

## Database Summary

**Total Tables**: 22
- **User Management**: 3 tables (users, vendor_profiles, refresh_tokens)
- **Product Catalog**: 5 tables (products, product_images, digital_assets, download_logs, categories)
- **Service Catalog**: 2 tables (services, service_images)
- **Orders & Payments**: 5 tables (orders, order_items, payments, invoices, cart_items)
- **Commission System**: 2 tables (commissions, vendor_payouts)
- **Reviews**: 2 tables (reviews, review_images)
- **Security & Audit**: 3 tables (refresh_tokens, password_reset_tokens, audit_logs)

**Key Features**:
- ✅ Full ACID compliance
- ✅ Proper foreign key relationships
- ✅ Comprehensive indexing strategy
- ✅ Automatic timestamp management
- ✅ Trigger-based calculations
- ✅ Full-text search support
- ✅ JSONB for flexible metadata
- ✅ UUID for all primary keys (better for distributed systems)
- ✅ Enum types for type safety
