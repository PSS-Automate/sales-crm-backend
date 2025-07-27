import { PrismaClient } from '@prisma/client';
import { PaginatedResult } from '@shared/interfaces/IRepository';
import { Product } from '../../../domain/entities/Product';
import { IProductRepository, ProductSearchOptions } from '../../../domain/repositories/IProductRepository';
import { SKU } from '../../../domain/value-objects/SKU';
import { ProductCategory, ProductCategoryType } from '../../../domain/value-objects/ProductCategory';
import { ProductType, ProductTypeValue } from '../../../domain/value-objects/ProductType';
import { ProductMapper } from '../mappers/ProductMapper';

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    return product ? ProductMapper.toDomain(product) : null;
  }

  async findAll(options?: any): Promise<PaginatedResult<Product>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (options?.search) {
      whereClause.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [options?.orderBy || 'name']: options?.orderDirection || 'asc' }
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      items: ProductMapper.toDomainList(products),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async create(product: Product): Promise<Product> {
    const createdProduct = await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.value,
        category: product.category.value,
        type: product.type.value,
        sku: product.sku.value,
        isActive: product.isActive,
        durationMinutes: product.durationMinutes || null,
        stockLevel: product.stockLevel || null,
        lowStockThreshold: product.lowStockThreshold || null,
        metadata: product.metadata || undefined,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });

    return ProductMapper.toDomain(createdProduct);
  }

  async update(id: string, product: Product): Promise<Product> {
    const prismaData = ProductMapper.toPrismaUpdate(product);
    
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: prismaData
    });

    return ProductMapper.toDomain(updatedProduct);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id }
    });
    return count > 0;
  }

  // SKU-based operations
  async findBySku(sku: SKU): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { sku: sku.value }
    });

    return product ? ProductMapper.toDomain(product) : null;
  }

  async getNextSequenceForCategory(categoryPrefix: string): Promise<number> {
    // Find the highest sequence number for this category prefix
    const lastProduct = await this.prisma.product.findFirst({
      where: {
        sku: {
          startsWith: `${categoryPrefix}-`
        }
      },
      orderBy: {
        sku: 'desc'
      }
    });

    if (!lastProduct) {
      return 1; // First product in this category
    }

    // Extract sequence number from SKU
    const skuParts = lastProduct.sku.split('-');
    if (skuParts.length !== 2) {
      return 1; // Fallback if SKU format is unexpected
    }

    const lastSequence = parseInt(skuParts[1], 10);
    return isNaN(lastSequence) ? 1 : lastSequence + 1;
  }

  // Category-based queries
  async findByCategory(category: ProductCategory, options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      category: category.value
    });
  }

  async findByCategories(categories: ProductCategory[], options?: any): Promise<PaginatedResult<Product>> {
    const categoryValues = categories.map(cat => cat.value);
    return this.searchProducts({
      ...options,
      categories: categoryValues
    });
  }

  // Type-based queries
  async findByType(type: ProductType, options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      type: type.value
    });
  }

  async findServices(options?: any): Promise<PaginatedResult<Product>> {
    return this.findByType(ProductType.create('SERVICE'), options);
  }

  async findPhysicalProducts(options?: any): Promise<PaginatedResult<Product>> {
    return this.findByType(ProductType.create('PHYSICAL_PRODUCT'), options);
  }

  async findPackages(options?: any): Promise<PaginatedResult<Product>> {
    return this.findByType(ProductType.create('PACKAGE'), options);
  }

  // Status-based queries
  async findActiveProducts(options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      isActive: true
    });
  }

  async findInactiveProducts(options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      isActive: false
    });
  }

  // Inventory management
  async findLowStockProducts(): Promise<Product[]> {
    // Use raw query for field comparison since Prisma doesn't support field-to-field comparison directly
    const products = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM products 
      WHERE type = 'PHYSICAL_PRODUCT' 
        AND "isActive" = true 
        AND "stockLevel" IS NOT NULL 
        AND "lowStockThreshold" IS NOT NULL 
        AND (
          ("stockLevel" > 0 AND "stockLevel" <= "lowStockThreshold") 
          OR "stockLevel" <= 0
        )
      ORDER BY "stockLevel" ASC
    `;

    return products.map(product => ProductMapper.createDomainFromData({
      ...product,
      price: Number(product.price)
    }));
  }

  async findOutOfStockProducts(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        type: 'PHYSICAL_PRODUCT',
        isActive: true,
        stockLevel: { lte: 0 }
      },
      orderBy: { name: 'asc' }
    });

    return ProductMapper.toDomainList(products);
  }

  async findProductsInStock(options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      inStock: true
    });
  }

  // Price-based queries
  async findProductsInPriceRange(minPrice: number, maxPrice: number, options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      priceMin: minPrice,
      priceMax: maxPrice
    });
  }

  async findExpensiveProducts(minPrice: number, options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      priceMin: minPrice
    });
  }

  async findAffordableProducts(maxPrice: number, options?: any): Promise<PaginatedResult<Product>> {
    return this.searchProducts({
      ...options,
      priceMax: maxPrice
    });
  }

  // Service-specific queries
  async findServicesByDuration(minMinutes: number, maxMinutes: number, options?: any): Promise<PaginatedResult<Product>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      type: 'SERVICE',
      isActive: true,
      durationMinutes: {
        gte: minMinutes,
        lte: maxMinutes
      }
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { durationMinutes: 'asc' }
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      items: ProductMapper.toDomainList(products),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findQuickServices(maxMinutes: number, options?: any): Promise<PaginatedResult<Product>> {
    return this.findServicesByDuration(0, maxMinutes, options);
  }

  // Business intelligence
  async findPopularProducts(options?: any): Promise<PaginatedResult<Product>> {
    // For now, return products ordered by creation date (newest first)
    // In the future, this could be based on sales data
    return this.searchProducts({
      ...options,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async findNewProducts(days: number, options?: any): Promise<PaginatedResult<Product>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      createdAt: { gte: cutoffDate },
      isActive: true
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      items: ProductMapper.toDomainList(products),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Advanced search
  async searchProducts(searchOptions: ProductSearchOptions): Promise<PaginatedResult<Product>> {
    const page = searchOptions.page || 1;
    const limit = Math.min(searchOptions.limit || 10, 100);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Text search
    if (searchOptions.search) {
      whereClause.OR = [
        { name: { contains: searchOptions.search, mode: 'insensitive' } },
        { description: { contains: searchOptions.search, mode: 'insensitive' } },
        { sku: { contains: searchOptions.search, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (searchOptions.category) {
      whereClause.category = searchOptions.category;
    }

    // Type filter
    if (searchOptions.type) {
      whereClause.type = searchOptions.type;
    }

    // Active status filter
    if (searchOptions.isActive !== undefined) {
      whereClause.isActive = searchOptions.isActive;
    }

    // Price range filter
    if (searchOptions.priceMin !== undefined || searchOptions.priceMax !== undefined) {
      whereClause.price = {};
      if (searchOptions.priceMin !== undefined) {
        whereClause.price.gte = searchOptions.priceMin;
      }
      if (searchOptions.priceMax !== undefined) {
        whereClause.price.lte = searchOptions.priceMax;
      }
    }

    // Stock filters
    if (searchOptions.inStock === true) {
      whereClause.OR = [
        { type: { not: 'PHYSICAL_PRODUCT' } }, // Services and packages are always "in stock"
        { AND: [{ type: 'PHYSICAL_PRODUCT' }, { stockLevel: { gt: 0 } }] }
      ];
    } else if (searchOptions.lowStock === true) {
      whereClause.AND = [
        { type: 'PHYSICAL_PRODUCT' },
        { stockLevel: { not: null } },
        { lowStockThreshold: { not: null } },
        { stockLevel: { lte: { field: 'lowStockThreshold' } } },
        { stockLevel: { gt: 0 } }
      ];
    }

    const orderBy = searchOptions.orderBy || 'name';
    const orderDirection = searchOptions.orderDirection || 'asc';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      items: ProductMapper.toDomainList(products),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Bulk operations
  async updatePricesForCategory(category: ProductCategory, priceMultiplier: number): Promise<void> {
    await this.prisma.product.updateMany({
      where: { category: category.value },
      data: {
        price: {
          multiply: priceMultiplier
        },
        updatedAt: new Date()
      }
    });
  }

  async deactivateProductsByCategory(category: ProductCategory): Promise<void> {
    await this.prisma.product.updateMany({
      where: { category: category.value },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  }

  async activateProductsByCategory(category: ProductCategory): Promise<void> {
    await this.prisma.product.updateMany({
      where: { category: category.value },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    });
  }

  // Analytics
  async getProductCountByCategory(): Promise<Array<{ category: string; count: number }>> {
    const result = await this.prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    return result.map(item => ({
      category: item.category,
      count: item._count.id
    }));
  }

  async getProductCountByType(): Promise<Array<{ type: string; count: number }>> {
    const result = await this.prisma.product.groupBy({
      by: ['type'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    return result.map(item => ({
      type: item.type,
      count: item._count.id
    }));
  }

  async getAveragePrice(): Promise<number> {
    const result = await this.prisma.product.aggregate({
      _avg: {
        price: true
      },
      where: {
        isActive: true
      }
    });

    return Number(result._avg.price) || 0;
  }

  async getAveragePriceByCategory(): Promise<Array<{ category: string; averagePrice: number }>> {
    const result = await this.prisma.product.groupBy({
      by: ['category'],
      _avg: {
        price: true
      },
      where: {
        isActive: true
      }
    });

    return result.map(item => ({
      category: item.category,
      averagePrice: Number(item._avg.price) || 0
    }));
  }
} 