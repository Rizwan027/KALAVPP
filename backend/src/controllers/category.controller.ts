import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import ApiResponse from '../utils/ApiResponse';

export class CategoryController {
  /**
   * Create new category (Admin only)
   * POST /api/v1/categories
   */
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all categories
   * GET /api/v1/categories
   */
  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category tree
   * GET /api/v1/categories/tree
   */
  static async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await CategoryService.getCategoryTree();
      return ApiResponse.success(res, tree, 'Category tree retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * GET /api/v1/categories/:id
   */
  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category (Admin only)
   * PUT /api/v1/categories/:id
   */
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category (Admin only)
   * DELETE /api/v1/categories/:id
   */
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.deleteCategory(req.params.id);
      return ApiResponse.success(res, result, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
