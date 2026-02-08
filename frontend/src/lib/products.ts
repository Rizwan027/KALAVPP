import api from './api';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'PHYSICAL' | 'DIGITAL';
  stockQuantity: number | null;
  categoryId: string;
  vendorId: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    user: {
      id: string;
      name: string;
    };
  };
  images: Array<{
    id: string;
    imageUrl: string;
    displayOrder: number;
  }>;
  avgRating?: number;
  reviewCount?: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  type?: 'PHYSICAL' | 'DIGITAL';
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
  sortBy?: 'createdAt' | 'price' | 'title' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export const productApi = {
  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data;
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, filters?: ProductFilters): Promise<ProductListResponse> => {
    return productApi.getProducts({ ...filters, categoryId });
  },

  // Get products by vendor
  getProductsByVendor: async (vendorId: string, filters?: ProductFilters): Promise<ProductListResponse> => {
    return productApi.getProducts({ ...filters, vendorId });
  },
};
