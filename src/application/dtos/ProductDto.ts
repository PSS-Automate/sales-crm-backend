import { ProductCategoryType } from '../../domain/value-objects/ProductCategory';
import { ProductTypeValue } from '../../domain/value-objects/ProductType';

// Request DTOs
export interface CreateProductRequestDto {
  name: string;
  description: string;
  price: number;
  category: ProductCategoryType;
  type: ProductTypeValue;
  durationMinutes?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
  metadata?: Record<string, any>;
}

export interface UpdateProductRequestDto {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
  metadata?: Record<string, any>;
}

export interface RestockProductRequestDto {
  quantity: number;
}

export interface ProductSearchRequestDto {
  search?: string;
  category?: ProductCategoryType;
  type?: ProductTypeValue;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Response DTOs
export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  category: ProductCategoryType;
  categoryDisplayName: string;
  type: ProductTypeValue;
  typeDisplayName: string;
  sku: string;
  isActive: boolean;
  durationMinutes?: number;
  durationFormatted?: string;
  stockLevel?: number;
  lowStockThreshold?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
  canBeOrdered: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponseDto {
  products: ProductResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: {
    category?: ProductCategoryType;
    type?: ProductTypeValue;
    isActive?: boolean;
    priceRange?: { min: number; max: number };
  };
}

export interface ProductCategoryResponseDto {
  category: ProductCategoryType;
  displayName: string;
  count: number;
  isServiceCategory: boolean;
  isProductCategory: boolean;
  skuPrefix: string;
}

export interface ProductStatsResponseDto {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  services: number;
  physicalProducts: number;
  packages: number;
  lowStockItems: number;
  outOfStockItems: number;
  averagePrice: number;
  categories: ProductCategoryResponseDto[];
}

// Business Operation DTOs
export interface LowStockReportDto {
  products: ProductResponseDto[];
  totalCount: number;
  criticalCount: number; // Out of stock
  warningCount: number;  // Low stock
  generatedAt: string;
}

export interface PriceUpdateDto {
  category: ProductCategoryType;
  multiplier: number; // 1.1 for 10% increase, 0.9 for 10% decrease
  affectedProducts: number;
}

// Validation helpers for DTOs
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ProductDtoValidator {
  static validateCreateProduct(dto: CreateProductRequestDto): ValidationResult {
    const errors: string[] = [];

    if (!dto.name || dto.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!dto.description || dto.description.trim().length < 10) {
      errors.push('Product description must be at least 10 characters long');
    }

    if (!dto.price || dto.price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!dto.category) {
      errors.push('Product category is required');
    }

    if (!dto.type) {
      errors.push('Product type is required');
    }

    // Type-specific validations
    if (dto.type === 'SERVICE' || dto.type === 'PACKAGE') {
      if (!dto.durationMinutes || dto.durationMinutes < 5) {
        errors.push('Services and packages must have a duration of at least 5 minutes');
      }
    }

    if (dto.type === 'PHYSICAL_PRODUCT') {
      if (dto.stockLevel !== undefined && dto.stockLevel < 0) {
        errors.push('Stock level cannot be negative');
      }
      if (dto.lowStockThreshold !== undefined && dto.lowStockThreshold < 0) {
        errors.push('Low stock threshold cannot be negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateProduct(dto: UpdateProductRequestDto): ValidationResult {
    const errors: string[] = [];

    if (dto.name !== undefined && dto.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (dto.description !== undefined && dto.description.trim().length < 10) {
      errors.push('Product description must be at least 10 characters long');
    }

    if (dto.price !== undefined && dto.price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (dto.durationMinutes !== undefined && dto.durationMinutes < 5) {
      errors.push('Duration must be at least 5 minutes');
    }

    if (dto.stockLevel !== undefined && dto.stockLevel < 0) {
      errors.push('Stock level cannot be negative');
    }

    if (dto.lowStockThreshold !== undefined && dto.lowStockThreshold < 0) {
      errors.push('Low stock threshold cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRestock(dto: RestockProductRequestDto): ValidationResult {
    const errors: string[] = [];

    if (!dto.quantity || dto.quantity <= 0) {
      errors.push('Restock quantity must be greater than 0');
    }

    if (dto.quantity > 10000) {
      errors.push('Restock quantity cannot exceed 10,000 items');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateSearch(dto: ProductSearchRequestDto): ValidationResult {
    const errors: string[] = [];

    if (dto.page !== undefined && dto.page < 1) {
      errors.push('Page number must be at least 1');
    }

    if (dto.limit !== undefined && (dto.limit < 1 || dto.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }

    if (dto.priceMin !== undefined && dto.priceMin < 0) {
      errors.push('Minimum price cannot be negative');
    }

    if (dto.priceMax !== undefined && dto.priceMax < 0) {
      errors.push('Maximum price cannot be negative');
    }

    if (dto.priceMin !== undefined && dto.priceMax !== undefined && dto.priceMin > dto.priceMax) {
      errors.push('Minimum price cannot be greater than maximum price');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 