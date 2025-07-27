import { UseCase } from '@shared/base-classes/UseCase';
import { NotFoundError } from '@shared/errors/DomainError';
import { IMenuItemRepository } from '../../../domain/repositories/IMenuItemRepository';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { MenuItemResponseDto } from '../../dtos/MenuItemDto';

export interface GetMenuItemByIdRequest {
  id: string;
}

export class GetMenuItemById extends UseCase<GetMenuItemByIdRequest, MenuItemResponseDto> {
  constructor(private menuItemRepository: IMenuItemRepository) {
    super();
  }

  public async execute(request: GetMenuItemByIdRequest): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemRepository.findById(request.id);

    if (!menuItem) {
      throw new NotFoundError('Menu item', request.id);
    }

    return this.mapToResponseDto(menuItem);
  }

  private mapToResponseDto(menuItem: MenuItem): MenuItemResponseDto {
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
      includedServices: json.includedServices,
      requirements: json.requirements,
      benefits: json.benefits,
      advanceBookingRequired: json.advanceBookingRequired,
      advanceBookingDays: json.advanceBookingDays,
      availableOnline: json.availableOnline,
      canBookOnline: json.canBookOnline,
      displayOrder: json.displayOrder,
      imageUrl: json.imageUrl,
      tags: json.tags,
      seasonalItem: json.seasonalItem,
      validFrom: json.validFrom,
      validTo: json.validTo,
      isAvailableToday: json.isAvailableToday,
      maxBookingsPerDay: json.maxBookingsPerDay,
      metadata: json.metadata,
      isActive: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };
  }
} 