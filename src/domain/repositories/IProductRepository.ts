import { IRepository, FindAllOptions, PaginatedResult } from '@shared/interfaces/IRepository';
import { Product } from '../entities/Product';
import { SKU } from '../value-objects/SKU';
import { ProductCategory, ProductCategoryType } from '../value-objects/ProductCategory';
import { ProductType, ProductTypeValue } from '../value-objects/ProductType';

export interface ProductSearchOptions extends FindAllOptions {
  category?: ProductCategoryType;
  type?: ProductTypeValue;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface IProductRepository extends IRepository<Product, string> {
  // SKU-based operations
  findBySku(sku: SKU): Promise<Product | null>;
  getNextSequenceForCategory(categoryPrefix: string): Promise<number>;
  
  // Category-based queries
  findByCategory(category: ProductCategory, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findByCategories(categories: ProductCategory[], options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Type-based queries
  findByType(type: ProductType, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findServices(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findPhysicalProducts(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findPackages(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Status-based queries
  findActiveProducts(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findInactiveProducts(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Inventory management
  findLowStockProducts(): Promise<Product[]>;
  findOutOfStockProducts(): Promise<Product[]>;
  findProductsInStock(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Price-based queries
  findProductsInPriceRange(minPrice: number, maxPrice: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findExpensiveProducts(minPrice: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findAffordableProducts(maxPrice: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Service-specific queries
  findServicesByDuration(minMinutes: number, maxMinutes: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findQuickServices(maxMinutes: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Business intelligence
  findPopularProducts(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findNewProducts(days: number, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  
  // Advanced search
  searchProducts(searchOptions: ProductSearchOptions): Promise<PaginatedResult<Product>>;
  
  // Bulk operations
  updatePricesForCategory(category: ProductCategory, priceMultiplier: number): Promise<void>;
  deactivateProductsByCategory(category: ProductCategory): Promise<void>;
  activateProductsByCategory(category: ProductCategory): Promise<void>;
  
  // Analytics
  getProductCountByCategory(): Promise<Array<{ category: string; count: number }>>;
  getProductCountByType(): Promise<Array<{ type: string; count: number }>>;
  getAveragePrice(): Promise<number>;
  getAveragePriceByCategory(): Promise<Array<{ category: string; averagePrice: number }>>;
} 