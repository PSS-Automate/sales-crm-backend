import { Product } from '../../../domain/entities/Product';
import { Price } from '../../../domain/value-objects/Price';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { ProductType } from '../../../domain/value-objects/ProductType';
import { SKU } from '../../../domain/value-objects/SKU';

export class ProductMapper {
  public static toDomain(prismaProduct: any): Product {
    // Convert Prisma Decimal to number for Price value object
    const priceValue = typeof prismaProduct.price === 'string' 
      ? parseFloat(prismaProduct.price)
      : Number(prismaProduct.price);

    return new Product({
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: Price.create(priceValue),
      category: ProductCategory.create(prismaProduct.category as any),
      type: ProductType.create(prismaProduct.type as any),
      sku: SKU.create(prismaProduct.sku),
      isActive: prismaProduct.isActive,
      durationMinutes: prismaProduct.durationMinutes || undefined,
      stockLevel: prismaProduct.stockLevel || undefined,
      lowStockThreshold: prismaProduct.lowStockThreshold || undefined,
      metadata: this.parseMetadata(prismaProduct.metadata),
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt
    });
  }

  public static toPrisma(product: Product): any {
    return {
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
      metadata: this.stringifyMetadata(product.metadata)
    };
  }

  public static toPrismaUpdate(product: Product): any {
    return {
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
      metadata: this.stringifyMetadata(product.metadata),
      updatedAt: new Date()
    };
  }

  private static parseMetadata(metadata: any): Record<string, any> | undefined {
    if (!metadata) return undefined;
    
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return undefined;
      }
    }
    
    if (typeof metadata === 'object') {
      return metadata as Record<string, any>;
    }
    
    return undefined;
  }

  private static stringifyMetadata(metadata?: Record<string, any>): any {
    if (!metadata || Object.keys(metadata).length === 0) {
      return null;
    }
    
    // Prisma will handle JSON serialization automatically
    return metadata;
  }

  // Helper method for bulk operations
  public static toDomainList(prismaProducts: any[]): Product[] {
    return prismaProducts.map(product => this.toDomain(product));
  }

  // Helper method for creating domain entities from minimal data
  public static createDomainFromData(data: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    type: string;
    sku: string;
    isActive: boolean;
    durationMinutes?: number | null;
    stockLevel?: number | null;
    lowStockThreshold?: number | null;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product({
      id: data.id,
      name: data.name,
      description: data.description,
      price: Price.create(data.price),
      category: ProductCategory.create(data.category as any),
      type: ProductType.create(data.type as any),
      sku: SKU.create(data.sku),
      isActive: data.isActive,
      durationMinutes: data.durationMinutes || undefined,
      stockLevel: data.stockLevel || undefined,
      lowStockThreshold: data.lowStockThreshold || undefined,
      metadata: this.parseMetadata(data.metadata),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
} 