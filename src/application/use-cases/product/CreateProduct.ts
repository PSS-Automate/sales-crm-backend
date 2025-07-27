import { UseCase } from '@shared/base-classes/UseCase';
import { ConflictError } from '@shared/errors/DomainError';
import { Product } from '../../../domain/entities/Product';
import { Price } from '../../../domain/value-objects/Price';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { ProductType } from '../../../domain/value-objects/ProductType';
import { SKU } from '../../../domain/value-objects/SKU';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { CreateProductRequestDto, ProductResponseDto } from '../../dtos/ProductDto';

export class CreateProduct extends UseCase<CreateProductRequestDto, ProductResponseDto> {
  constructor(private productRepository: IProductRepository) {
    super();
  }

  public async execute(request: CreateProductRequestDto): Promise<ProductResponseDto> {
    // Create value objects
    const price = Price.create(request.price);
    const category = ProductCategory.create(request.category);
    const type = ProductType.create(request.type);
    
    // Generate unique SKU
    const sku = await this.generateUniqueSKU(category);
    
    // Check if a product with similar name already exists in the same category
    await this.validateUniqueProduct(request.name, category);
    
    // Create the product entity
    const product = Product.create({
      name: request.name.trim(),
      description: request.description.trim(),
      price,
      category,
      type,
      sku,
      isActive: true,
      durationMinutes: request.durationMinutes,
      stockLevel: request.stockLevel,
      lowStockThreshold: request.lowStockThreshold,
      metadata: request.metadata
    });

    // Save to repository
    const savedProduct = await this.productRepository.create(product);

    // Return DTO
    return this.mapToResponseDto(savedProduct);
  }

  private async generateUniqueSKU(category: ProductCategory): Promise<SKU> {
    const categoryPrefix = category.getSkuPrefix();
    const nextSequence = await this.productRepository.getNextSequenceForCategory(categoryPrefix);
    return SKU.generate(categoryPrefix, nextSequence);
  }

  private async validateUniqueProduct(name: string, category: ProductCategory): Promise<void> {
    // Search for existing products with similar names in the same category
    const existingProducts = await this.productRepository.findByCategory(category, {
      search: name.trim(),
      page: 1,
      limit: 1
    });

    // Check for exact name matches (case-insensitive)
    const exactMatch = existingProducts.items.find(
      product => product.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exactMatch) {
      throw new ConflictError(`A product named "${name}" already exists in category ${category.getDisplayName()}`);
    }
  }

  private mapToResponseDto(product: Product): ProductResponseDto {
    const json = product.toJSON();
    
    return {
      id: json.id,
      name: json.name,
      description: json.description,
      price: json.price,
      priceFormatted: product.price.toCurrency(),
      category: json.category,
      categoryDisplayName: product.category.getDisplayName(),
      type: json.type,
      typeDisplayName: product.type.getDisplayName(),
      sku: json.sku,
      isActive: json.isActive,
      durationMinutes: json.durationMinutes,
      durationFormatted: json.durationMinutes ? this.formatDuration(json.durationMinutes) : undefined,
      stockLevel: json.stockLevel,
      lowStockThreshold: json.lowStockThreshold,
      isOutOfStock: json.isOutOfStock,
      isLowStock: json.isLowStock,
      canBeOrdered: json.canBeOrdered,
      metadata: json.metadata,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }
} 