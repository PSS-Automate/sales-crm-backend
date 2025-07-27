import { Entity } from '@shared/base-classes/Entity';
import { ValidationError, BusinessRuleViolationError } from '@shared/errors/DomainError';
import { Price, ServiceDuration, MenuCategory } from '../value-objects';

export interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  duration: ServiceDuration;
  price: Price;
  isPackage: boolean;
  includedServices?: string[];
  requirements?: string[];
  benefits?: string[];
  advanceBookingRequired: boolean;
  advanceBookingDays?: number;
  availableOnline: boolean;
  displayOrder: number;
  imageUrl?: string;
  tags?: string[];
  seasonalItem: boolean;
  validFrom?: Date;
  validTo?: Date;
  maxBookingsPerDay?: number;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MenuItem extends Entity<string> {
  private _name: string;
  private _description: string;
  private _category: MenuCategory;
  private _duration: ServiceDuration;
  private _price: Price;
  private _isPackage: boolean;
  private _includedServices: string[];
  private _requirements: string[];
  private _benefits: string[];
  private _advanceBookingRequired: boolean;
  private _advanceBookingDays?: number;
  private _availableOnline: boolean;
  private _displayOrder: number;
  private _imageUrl?: string;
  private _tags: string[];
  private _seasonalItem: boolean;
  private _validFrom?: Date;
  private _validTo?: Date;
  private _maxBookingsPerDay?: number;
  private _metadata?: Record<string, any>;
  private _isActive: boolean;

  constructor(props: MenuItemProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });

    this.validateName(props.name);
    this.validateDescription(props.description);
    this.validateDisplayOrder(props.displayOrder);
    this.validateBusinessRules(props);

    this._name = props.name;
    this._description = props.description;
    this._category = props.category;
    this._duration = props.duration;
    this._price = props.price;
    this._isPackage = props.isPackage;
    this._includedServices = props.includedServices || [];
    this._requirements = props.requirements || [];
    this._benefits = props.benefits || [];
    this._advanceBookingRequired = props.advanceBookingRequired;
    this._advanceBookingDays = props.advanceBookingDays;
    this._availableOnline = props.availableOnline ?? true;
    this._displayOrder = props.displayOrder;
    this._imageUrl = props.imageUrl;
    this._tags = props.tags || [];
    this._seasonalItem = props.seasonalItem;
    this._validFrom = props.validFrom;
    this._validTo = props.validTo;
    this._maxBookingsPerDay = props.maxBookingsPerDay;
    this._metadata = props.metadata;
    this._isActive = props.isActive ?? true;
  }

  // Getters
  public get name(): string { return this._name; }
  public get description(): string { return this._description; }
  public get category(): MenuCategory { return this._category; }
  public get duration(): ServiceDuration { return this._duration; }
  public get price(): Price { return this._price; }
  public get isPackage(): boolean { return this._isPackage; }
  public get includedServices(): string[] { return [...this._includedServices]; }
  public get requirements(): string[] { return [...this._requirements]; }
  public get benefits(): string[] { return [...this._benefits]; }
  public get advanceBookingRequired(): boolean { return this._advanceBookingRequired; }
  public get advanceBookingDays(): number | undefined { return this._advanceBookingDays; }
  public get availableOnline(): boolean { return this._availableOnline; }
  public get displayOrder(): number { return this._displayOrder; }
  public get imageUrl(): string | undefined { return this._imageUrl; }
  public get tags(): string[] { return [...this._tags]; }
  public get seasonalItem(): boolean { return this._seasonalItem; }
  public get validFrom(): Date | undefined { return this._validFrom; }
  public get validTo(): Date | undefined { return this._validTo; }
  public get maxBookingsPerDay(): number | undefined { return this._maxBookingsPerDay; }
  public get metadata(): Record<string, any> | undefined { return this._metadata; }
  public get isActive(): boolean { return this._isActive; }

  // Business methods
  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName;
    this.touch();
  }

  public updateDescription(newDescription: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touch();
  }

  public updatePrice(newPrice: Price): void {
    this._price = newPrice;
    this.touch();
  }

  public updateDuration(newDuration: ServiceDuration): void {
    this._duration = newDuration;
    this.touch();
  }

  public updateCategory(newCategory: MenuCategory): void {
    this._category = newCategory;
    // Update package status based on category
    this._isPackage = newCategory.isPackage();
    // Update advance booking requirements
    this._advanceBookingRequired = newCategory.requiresAdvanceBooking();
    this.touch();
  }

  public addIncludedService(service: string): void {
    if (this._includedServices.includes(service)) {
      throw new ValidationError('Service already included', 'includedServices');
    }
    this._includedServices.push(service);
    this.touch();
  }

  public removeIncludedService(service: string): void {
    const index = this._includedServices.indexOf(service);
    if (index === -1) {
      throw new ValidationError('Service not found in included services', 'includedServices');
    }
    this._includedServices.splice(index, 1);
    this.touch();
  }

  public addRequirement(requirement: string): void {
    if (this._requirements.includes(requirement)) {
      throw new ValidationError('Requirement already exists', 'requirements');
    }
    this._requirements.push(requirement);
    this.touch();
  }

  public removeRequirement(requirement: string): void {
    const index = this._requirements.indexOf(requirement);
    if (index === -1) {
      throw new ValidationError('Requirement not found', 'requirements');
    }
    this._requirements.splice(index, 1);
    this.touch();
  }

  public addBenefit(benefit: string): void {
    if (this._benefits.includes(benefit)) {
      throw new ValidationError('Benefit already exists', 'benefits');
    }
    this._benefits.push(benefit);
    this.touch();
  }

  public removeBenefit(benefit: string): void {
    const index = this._benefits.indexOf(benefit);
    if (index === -1) {
      throw new ValidationError('Benefit not found', 'benefits');
    }
    this._benefits.splice(index, 1);
    this.touch();
  }

  public updateDisplayOrder(newOrder: number): void {
    this.validateDisplayOrder(newOrder);
    this._displayOrder = newOrder;
    this.touch();
  }

  public updateAdvanceBookingRequirement(required: boolean, days?: number): void {
    this._advanceBookingRequired = required;
    if (required && days) {
      if (days < 1 || days > 365) {
        throw new ValidationError('Advance booking days must be between 1 and 365', 'advanceBookingDays');
      }
      this._advanceBookingDays = days;
    } else {
      this._advanceBookingDays = undefined;
    }
    this.touch();
  }

  public updateSeasonalValidity(validFrom?: Date, validTo?: Date): void {
    if (validFrom && validTo && validFrom >= validTo) {
      throw new ValidationError('Valid from date must be before valid to date', 'seasonalValidity');
    }
    this._validFrom = validFrom;
    this._validTo = validTo;
    this._seasonalItem = !!(validFrom || validTo);
    this.touch();
  }

  public addTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) {
      throw new ValidationError('Tag cannot be empty', 'tags');
    }
    if (!this._tags.includes(normalizedTag)) {
      this._tags.push(normalizedTag);
      this.touch();
    }
  }

  public removeTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    const index = this._tags.indexOf(normalizedTag);
    if (index !== -1) {
      this._tags.splice(index, 1);
      this.touch();
    }
  }

  public setOnlineAvailability(available: boolean): void {
    this._availableOnline = available;
    this.touch();
  }

  public setMaxBookingsPerDay(max?: number): void {
    if (max !== undefined && max < 1) {
      throw new ValidationError('Max bookings per day must be at least 1', 'maxBookingsPerDay');
    }
    this._maxBookingsPerDay = max;
    this.touch();
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  // Business queries
  public isAvailableToday(): boolean {
    if (!this._isActive) return false;
    
    const today = new Date();
    
    if (this._seasonalItem) {
      if (this._validFrom && today < this._validFrom) return false;
      if (this._validTo && today > this._validTo) return false;
    }
    
    return true;
  }

  public isAvailableOnDate(date: Date): boolean {
    if (!this._isActive) return false;
    
    if (this._seasonalItem) {
      if (this._validFrom && date < this._validFrom) return false;
      if (this._validTo && date > this._validTo) return false;
    }
    
    return true;
  }

  public canBookOnline(): boolean {
    return this._isActive && this._availableOnline;
  }

  public needsAdvanceBooking(): boolean {
    return this._advanceBookingRequired;
  }

  public getMinimumAdvanceBookingDate(): Date | null {
    if (!this._advanceBookingRequired || !this._advanceBookingDays) return null;
    
    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() + this._advanceBookingDays);
    return minimumDate;
  }

  public calculateDiscountedPrice(discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100', 'discountPercent');
    }
    
    const discountAmount = (this._price.value * discountPercent) / 100;
    const discountedAmount = this._price.value - discountAmount;
    
    return Price.create(discountedAmount);
  }

  public getEstimatedEndTime(startTime: Date): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + this._duration.getMinutes());
    return endTime;
  }

  // Validation methods
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Menu item name is required', 'name');
    }

    if (name.trim().length < 3) {
      throw new ValidationError('Menu item name must be at least 3 characters', 'name');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('Menu item name cannot exceed 100 characters', 'name');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Menu item description is required', 'description');
    }

    if (description.trim().length < 10) {
      throw new ValidationError('Menu item description must be at least 10 characters', 'description');
    }

    if (description.trim().length > 1000) {
      throw new ValidationError('Menu item description cannot exceed 1000 characters', 'description');
    }
  }

  private validateDisplayOrder(order: number): void {
    if (typeof order !== 'number' || order < 0) {
      throw new ValidationError('Display order must be a non-negative number', 'displayOrder');
    }
  }

  private validateBusinessRules(props: MenuItemProps): void {
    // Packages must have included services
    if (props.isPackage && (!props.includedServices || props.includedServices.length === 0)) {
      throw new BusinessRuleViolationError('Package menu items must have at least one included service');
    }

    // Advance booking validation
    if (props.advanceBookingRequired && props.advanceBookingDays && props.advanceBookingDays < 1) {
      throw new ValidationError('Advance booking days must be at least 1 when advance booking is required', 'advanceBookingDays');
    }

    // Seasonal item validation
    if (props.seasonalItem && props.validFrom && props.validTo && props.validFrom >= props.validTo) {
      throw new ValidationError('Seasonal item valid from date must be before valid to date', 'seasonalValidity');
    }

    // Category consistency
    if (props.isPackage !== props.category.isPackage()) {
      throw new BusinessRuleViolationError('Package flag must match category type');
    }
  }

  // Factory method
  public static create(props: Omit<MenuItemProps, 'id' | 'createdAt' | 'updatedAt'>): MenuItem {
    return new MenuItem({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...props
    });
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      category: this._category.toString(),
      categoryDisplay: this._category.getDisplayName(),
      duration: this._duration.getMinutes(),
      durationDisplay: this._duration.getDisplayTime(),
      price: this._price.value,
      priceDisplay: this._price.toCurrency(),
      isPackage: this._isPackage,
      includedServices: this._includedServices,
      requirements: this._requirements,
      benefits: this._benefits,
      advanceBookingRequired: this._advanceBookingRequired,
      advanceBookingDays: this._advanceBookingDays,
      availableOnline: this._availableOnline,
      canBookOnline: this.canBookOnline(),
      displayOrder: this._displayOrder,
      imageUrl: this._imageUrl,
      tags: this._tags,
      seasonalItem: this._seasonalItem,
      validFrom: this._validFrom?.toISOString(),
      validTo: this._validTo?.toISOString(),
      isAvailableToday: this.isAvailableToday(),
      maxBookingsPerDay: this._maxBookingsPerDay,
      metadata: this._metadata,
      isActive: this._isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
} 