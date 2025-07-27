import { Entity } from '@shared/base-classes/Entity';
import { ValidationError, BusinessRuleViolationError } from '@shared/errors/DomainError';
import { Price } from '../value-objects/Price';
import { ProductCategory } from '../value-objects/ProductCategory';
import { ProductType } from '../value-objects/ProductType';
import { SKU } from '../value-objects/SKU';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Price;
  category: ProductCategory;
  type: ProductType;
  sku: SKU;
  isActive: boolean;
  durationMinutes?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<string> {
  private _name: string;
  private _description: string;
  private _price: Price;
  private _category: ProductCategory;
  private _type: ProductType;
  private _sku: SKU;
  private _isActive: boolean;
  private _durationMinutes?: number;
  private _stockLevel?: number;
  private _lowStockThreshold?: number;
  private _metadata?: Record<string, any>;

  constructor(props: ProductProps) {
    super({ 
      id: props.id, 
      createdAt: props.createdAt, 
      updatedAt: props.updatedAt 
    });
    
    this.validateName(props.name);
    this.validateDescription(props.description);
    this.validateBusinessRules(props.type, props.durationMinutes, props.stockLevel, props.lowStockThreshold);
    
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._category = props.category;
    this._type = props.type;
    this._sku = props.sku;
    this._isActive = props.isActive;
    this._durationMinutes = props.durationMinutes;
    this._stockLevel = props.stockLevel;
    this._lowStockThreshold = props.lowStockThreshold;
    this._metadata = props.metadata;
  }

  // Getters
  public get name(): string { return this._name; }
  public get description(): string { return this._description; }
  public get price(): Price { return this._price; }
  public get category(): ProductCategory { return this._category; }
  public get type(): ProductType { return this._type; }
  public get sku(): SKU { return this._sku; }
  public get isActive(): boolean { return this._isActive; }
  public get durationMinutes(): number | undefined { return this._durationMinutes; }
  public get stockLevel(): number | undefined { return this._stockLevel; }
  public get lowStockThreshold(): number | undefined { return this._lowStockThreshold; }
  public get metadata(): Record<string, any> | undefined { return this._metadata; }

  // Business Methods
  public updatePrice(newPrice: Price): void {
    this._price = newPrice;
    this.touch();
  }

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

  public updateDuration(durationMinutes: number): void {
    if (!this._type.requiresDuration()) {
      throw new BusinessRuleViolationError('Only services and packages can have duration');
    }
    
    this.validateDuration(durationMinutes);
    this._durationMinutes = durationMinutes;
    this.touch();
  }

  public restockItem(quantity: number): void {
    if (!this._type.requiresInventory()) {
      throw new BusinessRuleViolationError('Only physical products can be restocked');
    }
    
    if (quantity < 0) {
      throw new ValidationError('Restock quantity must be positive');
    }
    
    this._stockLevel = (this._stockLevel || 0) + quantity;
    this.touch();
  }

  public reduceStock(quantity: number): void {
    if (!this._type.requiresInventory()) {
      throw new BusinessRuleViolationError('Only physical products have stock');
    }
    
    if (quantity < 0) {
      throw new ValidationError('Stock reduction quantity must be positive');
    }
    
    const currentStock = this._stockLevel || 0;
    if (quantity > currentStock) {
      throw new BusinessRuleViolationError('Cannot reduce stock below zero');
    }
    
    this._stockLevel = currentStock - quantity;
    this.touch();
  }

  public markAsOutOfStock(): void {
    if (!this._type.requiresInventory()) {
      throw new BusinessRuleViolationError('Only physical products can be out of stock');
    }
    
    this._stockLevel = 0;
    this.touch();
  }

  public updateStockThreshold(threshold: number): void {
    if (!this._type.requiresInventory()) {
      throw new BusinessRuleViolationError('Only physical products have stock thresholds');
    }
    
    if (threshold < 0) {
      throw new ValidationError('Stock threshold must be non-negative');
    }
    
    this._lowStockThreshold = threshold;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public reactivate(): void {
    this._isActive = true;
    this.touch();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.touch();
  }

  // Business Queries
  public isOutOfStock(): boolean {
    if (!this._type.requiresInventory()) {
      return false;
    }
    return (this._stockLevel || 0) === 0;
  }

  public isLowStock(): boolean {
    if (!this._type.requiresInventory()) {
      return false;
    }
    
    const currentStock = this._stockLevel || 0;
    const threshold = this._lowStockThreshold || 0;
    
    return currentStock <= threshold && currentStock > 0;
  }

  public isService(): boolean {
    return this._type.isService();
  }

  public isPhysicalProduct(): boolean {
    return this._type.isPhysicalProduct();
  }

  public isPackage(): boolean {
    return this._type.isPackage();
  }

  public getDiscountedPrice(discountPercent: number): Price {
    return this._price.applyDiscount(discountPercent);
  }

  public canBeOrdered(): boolean {
    if (!this._isActive) {
      return false;
    }
    
    if (this._type.requiresInventory() && this.isOutOfStock()) {
      return false;
    }
    
    return true;
  }

  // Factory Method
  public static create(props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date();
    return new Product({
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...props
    });
  }

  // Validation Methods
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Product name is required');
    }
    
    if (name.trim().length < 2) {
      throw new ValidationError('Product name must be at least 2 characters long');
    }
    
    if (name.trim().length > 100) {
      throw new ValidationError('Product name cannot exceed 100 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Product description is required');
    }
    
    if (description.trim().length < 10) {
      throw new ValidationError('Product description must be at least 10 characters long');
    }
    
    if (description.trim().length > 500) {
      throw new ValidationError('Product description cannot exceed 500 characters');
    }
  }

  private validateDuration(durationMinutes: number): void {
    if (durationMinutes < 5) {
      throw new ValidationError('Service duration must be at least 5 minutes');
    }
    
    if (durationMinutes > 480) { // 8 hours
      throw new ValidationError('Service duration cannot exceed 8 hours (480 minutes)');
    }
    
    if (durationMinutes % 5 !== 0) {
      throw new ValidationError('Service duration must be in 5-minute increments');
    }
  }

  private validateBusinessRules(
    type: ProductType, 
    durationMinutes?: number, 
    stockLevel?: number, 
    lowStockThreshold?: number
  ): void {
    // Services and packages should have duration
    if (type.requiresDuration()) {
      if (durationMinutes === undefined) {
        throw new BusinessRuleViolationError('Services and packages must have a duration');
      }
      this.validateDuration(durationMinutes);
    } else {
      if (durationMinutes !== undefined) {
        throw new BusinessRuleViolationError('Only services and packages can have duration');
      }
    }

    // Physical products should have stock tracking
    if (type.requiresInventory()) {
      if (stockLevel !== undefined && stockLevel < 0) {
        throw new ValidationError('Stock level cannot be negative');
      }
      if (lowStockThreshold !== undefined && lowStockThreshold < 0) {
        throw new ValidationError('Low stock threshold cannot be negative');
      }
    } else {
      if (stockLevel !== undefined || lowStockThreshold !== undefined) {
        throw new BusinessRuleViolationError('Only physical products can have stock tracking');
      }
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      price: this._price.value,
      category: this._category.value,
      type: this._type.value,
      sku: this._sku.value,
      isActive: this._isActive,
      durationMinutes: this._durationMinutes,
      stockLevel: this._stockLevel,
      lowStockThreshold: this._lowStockThreshold,
      isOutOfStock: this.isOutOfStock(),
      isLowStock: this.isLowStock(),
      canBeOrdered: this.canBeOrdered(),
      metadata: this._metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
} 