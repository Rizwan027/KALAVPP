import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import ApiError from '../utils/ApiError';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param roles - Array of roles that are allowed to access the route
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to access this resource')
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(ApiError.forbidden('Admin access required'));
  }

  next();
};

/**
 * Check if user is vendor
 */
export const isVendor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== UserRole.VENDOR && req.user.role !== UserRole.ADMIN) {
    return next(ApiError.forbidden('Vendor access required'));
  }

  next();
};

/**
 * Check if user is vendor or admin
 */
export const isVendorOrAdmin = authorize(UserRole.VENDOR, UserRole.ADMIN);

/**
 * Check if user is customer (any authenticated user)
 */
export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  next();
};
