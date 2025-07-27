import { UseCase } from '@shared/base-classes/UseCase';
import { NotFoundError, BusinessRuleViolationError } from '@shared/errors/DomainError';
import { Product } from '../../../domain/entities/Product';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { RestockProductRequestDto, ProductResponseDto } from '../../dtos/ProductDto';

export class RestockProduct extends UseCase<{ productId: string; request: RestockProductRequestDto }, ProductResponseDto> {
  constructor(private productRepository: IProductRepository) {
    super();
  }

  public async execute({ productId, request }: { productId: string; request: RestockProductRequestDto }): Promise<ProductResponseDto> {
    // Find the product
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new NotFoundError(`Product with identifier '${productId}' not found`);
    }

    // Validate business rules
    if (!product.isPhysicalProduct()) {
      throw new BusinessRuleViolationError('Only physical products can be restocked');
    }

    if (!product.isActive) {
      throw new BusinessRuleViolationError('Cannot restock inactive products');
    }

    // Perform restocking
    product.restockItem(request.quantity);

    // Save updated product
    const updatedProduct = await this.productRepository.update(productId, product);

    // Return DTO
    return this.mapToResponseDto(updatedProduct);
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