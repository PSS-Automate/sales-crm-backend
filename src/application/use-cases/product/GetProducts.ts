import { UseCase } from '@shared/base-classes/UseCase';
import { Product } from '../../../domain/entities/Product';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { ProductType } from '../../../domain/value-objects/ProductType';
import { IProductRepository, ProductSearchOptions } from '../../../domain/repositories/IProductRepository';
import { ProductSearchRequestDto, ProductListResponseDto, ProductResponseDto } from '../../dtos/ProductDto';

export class GetProducts extends UseCase<ProductSearchRequestDto, ProductListResponseDto> {
  constructor(private productRepository: IProductRepository) {
    super();
  }

  public async execute(request: ProductSearchRequestDto): Promise<ProductListResponseDto> {
    // Build search options
    const searchOptions = this.buildSearchOptions(request);
    
    // Execute search
    const result = await this.productRepository.searchProducts(searchOptions);
    
    // Map to response DTOs
    const productDtos = result.items.map(product => this.mapToResponseDto(product));
    
    return {
      products: productDtos,
      pagination: result.pagination,
      filters: this.buildAppliedFilters(request)
    };
  }

  private buildSearchOptions(request: ProductSearchRequestDto): ProductSearchOptions {
    const options: ProductSearchOptions = {
      page: request.page || 1,
      limit: Math.min(request.limit || 10, 100), // Cap at 100
      orderBy: request.sortBy || 'name',
      orderDirection: request.sortOrder || 'asc'
    };

    // Add search term
    if (request.search) {
      options.search = request.search.trim();
    }

    // Add category filter
    if (request.category) {
      options.category = request.category;
    }

    // Add type filter
    if (request.type) {
      options.type = request.type;
    }

    // Add status filter
    if (request.isActive !== undefined) {
      options.isActive = request.isActive;
    }

    // Add price range filters
    if (request.priceMin !== undefined) {
      options.priceMin = request.priceMin;
    }
    if (request.priceMax !== undefined) {
      options.priceMax = request.priceMax;
    }

    // Add inventory filters
    if (request.inStock !== undefined) {
      options.inStock = request.inStock;
    }
    if (request.lowStock !== undefined) {
      options.lowStock = request.lowStock;
    }

    return options;
  }

  private buildAppliedFilters(request: ProductSearchRequestDto) {
    const filters: any = {};

    if (request.category) {
      filters.category = request.category;
    }

    if (request.type) {
      filters.type = request.type;
    }

    if (request.isActive !== undefined) {
      filters.isActive = request.isActive;
    }

    if (request.priceMin !== undefined || request.priceMax !== undefined) {
      filters.priceRange = {
        min: request.priceMin,
        max: request.priceMax
      };
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
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