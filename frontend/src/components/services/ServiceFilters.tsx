'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

interface ServiceFiltersProps {
  filters: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function ServiceFilters({ filters, onFilterChange }: ServiceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    key => localFilters[key as keyof typeof localFilters] !== undefined && localFilters[key as keyof typeof localFilters] !== ''
  ).length;

  return (
    <div className="mb-6">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden btn-secondary w-full flex items-center justify-center gap-2 mb-4"
      >
        <FiFilter />
        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
      </button>

      {/* Filter Panel */}
      <div className={`${
        isOpen ? 'block' : 'hidden'
      } lg:block bg-white rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <FiX className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={localFilters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
                min="0"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input-field"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="title">Name</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={localFilters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="input-field"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Apply Button (Mobile) */}
          <button
            onClick={applyFilters}
            className="lg:hidden btn-primary w-full"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
