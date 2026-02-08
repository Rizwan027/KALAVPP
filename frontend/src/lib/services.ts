import api from './api';

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  deliveryTime?: string;
  requirements?: string;
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

export interface ServiceListResponse {
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
  sortBy?: 'createdAt' | 'price' | 'title' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export const serviceApi = {
  // Get all services with filters
  getServices: async (filters?: ServiceFilters): Promise<ServiceListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/services?${params.toString()}`);
    return response.data.data;
  },

  // Get single service
  getService: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  },

  // Get services by category
  getServicesByCategory: async (categoryId: string, filters?: ServiceFilters): Promise<ServiceListResponse> => {
    return serviceApi.getServices({ ...filters, categoryId });
  },

  // Get services by vendor
  getServicesByVendor: async (vendorId: string, filters?: ServiceFilters): Promise<ServiceListResponse> => {
    return serviceApi.getServices({ ...filters, vendorId });
  },
};
