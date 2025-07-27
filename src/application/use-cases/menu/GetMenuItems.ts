import { UseCase } from '@shared/base-classes/UseCase';
import { IMenuItemRepository } from '../../../domain/repositories/IMenuItemRepository';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { MenuCategory } from '../../../domain/value-objects/MenuCategory';
import { GetMenuItemsFilterDto, MenuItemListResponseDto, MenuItemSummaryResponseDto } from '../../dtos/MenuItemDto';

export class GetMenuItems extends UseCase<GetMenuItemsFilterDto, MenuItemListResponseDto> {
  constructor(private menuItemRepository: IMenuItemRepository) {
    super();
  }

  public async execute(request: GetMenuItemsFilterDto): Promise<MenuItemListResponseDto> {
    // Set default pagination
    const page = request.page || 1;
    const limit = Math.min(request.limit || 20, 100); // Max 100 items per page

    // Build find options
    const findOptions = {
      page,
      limit,
      search: request.search?.trim(),
      sortBy: request.sortBy || 'displayOrder',
      sortOrder: request.sortOrder || 'asc' as const
    };

    // Build filters
    const filters = {
      category: request.category ? MenuCategory.create(request.category as any) : undefined,
      isActive: request.isActive,
      isPackage: request.isPackage,
      availableOnline: request.availableOnline,
      seasonalItem: request.seasonalItem,
      advanceBookingRequired: request.advanceBookingRequired,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      minDuration: request.minDuration,
      maxDuration: request.maxDuration,
      tags: request.tags
    };

    // Execute search based on filters
    let result;
    
    if (request.availableForDate) {
      // Special case: filter by availability for a specific date
      const date = new Date(request.availableForDate);
      result = await this.menuItemRepository.findAvailableItemsForDate(date, findOptions);
    } else {
      // Standard filtering
      result = await this.menuItemRepository.findByFilters(filters, findOptions);
    }

    // Map to response DTOs
    const menuItems = result.items.map((menuItem: MenuItem) => this.mapToSummaryDto(menuItem));

    return {
      menuItems,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.pages
    };
  }

  private mapToSummaryDto(menuItem: any): MenuItemSummaryResponseDto {
    const json = menuItem.toJSON();
    
    return {
      id: json.id,
      name: json.name,
      description: json.description,
      category: json.category,
      categoryDisplay: json.categoryDisplay,
      duration: json.duration,
      durationDisplay: json.durationDisplay,
      price: json.price,
      priceDisplay: json.priceDisplay,
      isPackage: json.isPackage,
      availableOnline: json.availableOnline,
      isAvailableToday: json.isAvailableToday,
      displayOrder: json.displayOrder,
      imageUrl: json.imageUrl,
      isActive: json.isActive
    };
  }
} 