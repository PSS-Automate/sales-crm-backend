import { UseCase } from '@shared/base-classes/UseCase';
import { ValidationError, ConflictError } from '@shared/errors/DomainError';
import { IMenuItemRepository } from '../../../domain/repositories/IMenuItemRepository';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { Price, ServiceDuration, MenuCategory } from '../../../domain/value-objects';
import { CreateMenuItemRequestDto, MenuItemResponseDto } from '../../dtos/MenuItemDto';

export class CreateMenuItem extends UseCase<CreateMenuItemRequestDto, MenuItemResponseDto> {
  constructor(private menuItemRepository: IMenuItemRepository) {
    super();
  }

  public async execute(request: CreateMenuItemRequestDto): Promise<MenuItemResponseDto> {
    // 1. Validate input
    this.validateInput(request);

    // 2. Check for duplicates
    await this.checkForDuplicates(request);

    // 3. Create domain objects
    const category = MenuCategory.create(request.category as any);
    const duration = ServiceDuration.create(request.duration);
    const price = Price.create(request.price);

    // 4. Determine display order if not provided
    const displayOrder = request.displayOrder ?? await this.getNextDisplayOrder(category);

    // 5. Create menu item entity
    const menuItem = MenuItem.create({
      name: request.name.trim(),
      description: request.description.trim(),
      category,
      duration,
      price,
      isPackage: request.isPackage ?? category.isPackage(),
      includedServices: request.includedServices || [],
      requirements: request.requirements || [],
      benefits: request.benefits || [],
      advanceBookingRequired: request.advanceBookingRequired ?? category.requiresAdvanceBooking(),
      advanceBookingDays: request.advanceBookingDays,
      availableOnline: request.availableOnline ?? true,
      displayOrder,
      imageUrl: request.imageUrl?.trim(),
      tags: request.tags || [],
      seasonalItem: request.seasonalItem ?? false,
      validFrom: request.validFrom ? new Date(request.validFrom) : undefined,
      validTo: request.validTo ? new Date(request.validTo) : undefined,
      maxBookingsPerDay: request.maxBookingsPerDay,
      metadata: request.metadata,
      isActive: true
    });

    // 6. Save menu item
    const savedMenuItem = await this.menuItemRepository.create(menuItem);

    // 7. Return response DTO
    return this.mapToResponseDto(savedMenuItem);
  }

  private validateInput(request: CreateMenuItemRequestDto): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new ValidationError('Menu item name is required', 'name');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new ValidationError('Menu item description is required', 'description');
    }

    if (!request.category) {
      throw new ValidationError('Menu item category is required', 'category');
    }

    if (!request.duration || request.duration <= 0) {
      throw new ValidationError('Menu item duration is required and must be positive', 'duration');
    }

    if (!request.price || request.price <= 0) {
      throw new ValidationError('Menu item price is required and must be positive', 'price');
    }

    // Validate seasonal dates
    if (request.validFrom && request.validTo) {
      const validFrom = new Date(request.validFrom);
      const validTo = new Date(request.validTo);
      
      if (validFrom >= validTo) {
        throw new ValidationError('Valid from date must be before valid to date', 'seasonalDates');
      }
    }

    // Validate advance booking
    if (request.advanceBookingRequired && request.advanceBookingDays && request.advanceBookingDays < 1) {
      throw new ValidationError('Advance booking days must be at least 1 when advance booking is required', 'advanceBookingDays');
    }

    // Validate package services
    if (request.isPackage && (!request.includedServices || request.includedServices.length === 0)) {
      throw new ValidationError('Package menu items must have at least one included service', 'includedServices');
    }

    // Validate display order
    if (request.displayOrder !== undefined && request.displayOrder < 0) {
      throw new ValidationError('Display order must be non-negative', 'displayOrder');
    }

    // Validate max bookings per day
    if (request.maxBookingsPerDay !== undefined && request.maxBookingsPerDay < 1) {
      throw new ValidationError('Max bookings per day must be at least 1', 'maxBookingsPerDay');
    }
  }

  private async checkForDuplicates(request: CreateMenuItemRequestDto): Promise<void> {
    // Check for duplicate name
    const existingByName = await this.menuItemRepository.findByName(request.name.trim());
    if (existingByName) {
      throw new ConflictError('Menu item with this name already exists');
    }

    // Check for duplicate display order if provided
    if (request.displayOrder !== undefined) {
      const existingByOrder = await this.menuItemRepository.findByDisplayOrder(request.displayOrder);
      if (existingByOrder) {
        throw new ConflictError('Menu item with this display order already exists');
      }
    }
  }

  private async getNextDisplayOrder(category: MenuCategory): Promise<number> {
    return await this.menuItemRepository.getNextDisplayOrder(category);
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