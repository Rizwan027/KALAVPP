# KALAVPP Frontend

Modern, responsive frontend for KALAVPP - ArtCommerce & Creative Services Platform built with Next.js 14, React 18, and TypeScript.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: Formik + Yup
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── products/           # Products pages
│   │   ├── services/           # Services pages
│   │   ├── vendor/             # Vendor dashboard
│   │   └── admin/              # Admin panel
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── home/               # Home page components
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Library code
│   │   ├── api.ts              # API client
│   │   └── auth.ts             # Auth utilities
│   ├── store/                  # Redux store
│   │   ├── index.ts            # Store configuration
│   │   └── slices/             # Redux slices
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
│       └── globals.css
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Features

### Implemented
✅ **Authentication System**
- User registration (Customer/Vendor)
- Login/Logout
- JWT token management
- Protected routes
- Role-based access control

✅ **State Management**
- Redux Toolkit for global state
- React Query for server state
- Persistent cart state
- Auth state management

✅ **UI/UX**
- Fully responsive design
- Mobile-first approach
- Dark mode ready
- Smooth animations
- Toast notifications
- Loading states

✅ **Pages**
- Home page with hero, categories, featured products
- Login page
- Registration page
- Layout with header and footer

### To Be Implemented
🔲 Product listing and detail pages
🔲 Service listing and detail pages
🔲 Shopping cart and checkout
🔲 Vendor dashboard
🔲 Admin panel
🔲 User profile management
🔲 Order management
🔲 Payment integration (Stripe)

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=false
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Component Guidelines

### File Naming
- Components: PascalCase (e.g., `Header.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Pages: lowercase (e.g., `page.tsx`)

### Component Structure
```tsx
'use client'; // Only if using client-side features

import { useState } from 'react';
import type { ComponentProps } from './types';

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState();

  return (
    <div className="container">
      {/* Component content */}
    </div>
  );
}
```

## Styling Guidelines

### Using Tailwind CSS
- Use utility classes for most styling
- Create custom classes in `globals.css` for repeated patterns
- Follow mobile-first responsive design

### Example
```tsx
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white shadow-sm
  hover:shadow-md transition-shadow
  md:p-6
">
  {/* Content */}
</div>
```

## API Integration

### Making API Calls
```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return <div>{/* Render products */}</div>;
}
```

## State Management

### Using Redux
```tsx
import { useAppSelector, useAppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';

function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
    }));
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

## Performance Optimization

- ✅ Automatic code splitting
- ✅ Image optimization with Next.js Image
- ✅ Static site generation for public pages
- ✅ API response caching
- ✅ Lazy loading components

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
1. Build the application: `npm run build`
2. Upload the `.next` folder to your hosting
3. Set environment variables
4. Run `npm start`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and type checking
5. Submit a pull request

## License

MIT
