import { Entity } from '@shared/base-classes/Entity';
import { Email, Phone, LoyaltyPoints } from '../value-objects';
import { ValidationError, BusinessRuleViolationError } from '@shared/errors/DomainError';

export interface CustomerProps {
  id: string;
  name: string;
  email: Email;
  phone: Phone;
  whatsappId?: string;
  avatar?: string;
  loyaltyPoints: LoyaltyPoints;
  totalVisits: number;
  lastVisit?: Date;
  preferences?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer extends Entity<string> {
  private _name: string;
  private _email: Email;
  private _phone: Phone;
  private _whatsappId?: string;
  private _avatar?: string;
  private _loyaltyPoints: LoyaltyPoints;
  private _totalVisits: number;
  private _lastVisit?: Date;
  private _preferences?: string;
  private _metadata?: Record<string, any>;
  private _isActive: boolean;

  constructor(props: CustomerProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });

    this.validateName(props.name);
    
    this._name = props.name;
    this._email = props.email;
    this._phone = props.phone;
    this._whatsappId = props.whatsappId;
    this._avatar = props.avatar;
    this._loyaltyPoints = props.loyaltyPoints;
    this._totalVisits = props.totalVisits || 0;
    this._lastVisit = props.lastVisit;
    this._preferences = props.preferences;
    this._metadata = props.metadata;
    this._isActive = props.isActive ?? true;
  }

  // Getters
  public get name(): string {
    return this._name;
  }

  public get email(): Email {
    return this._email;
  }

  public get phone(): Phone {
    return this._phone;
  }

  public get whatsappId(): string | undefined {
    return this._whatsappId;
  }

  public get avatar(): string | undefined {
    return this._avatar;
  }

  public get loyaltyPoints(): LoyaltyPoints {
    return this._loyaltyPoints;
  }

  public get totalVisits(): number {
    return this._totalVisits;
  }

  public get lastVisit(): Date | undefined {
    return this._lastVisit;
  }

  public get preferences(): string | undefined {
    return this._preferences;
  }

  public get metadata(): Record<string, any> | undefined {
    return this._metadata;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  // Business methods
  public updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.touch();
  }

  public updateEmail(email: Email): void {
    this._email = email;
    this.touch();
  }

  public updatePhone(phone: Phone): void {
    this._phone = phone;
    this.touch();
  }

  public updateWhatsappId(whatsappId: string): void {
    this._whatsappId = whatsappId;
    this.touch();
  }

  public updateAvatar(avatar: string): void {
    this._avatar = avatar;
    this.touch();
  }

  public addLoyaltyPoints(points: number): void {
    this._loyaltyPoints = this._loyaltyPoints.add(points);
    this.touch();
  }

  public redeemLoyaltyPoints(points: number): void {
    if (!this._loyaltyPoints.canRedeem(points)) {
      throw new BusinessRuleViolationError(`Insufficient loyalty points. Available: ${this._loyaltyPoints.value}, Required: ${points}`);
    }
    this._loyaltyPoints = this._loyaltyPoints.subtract(points);
    this.touch();
  }

  public recordVisit(): void {
    this._totalVisits += 1;
    this._lastVisit = new Date();
    this.touch();
  }

  public updatePreferences(preferences: string): void {
    this._preferences = preferences;
    this.touch();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
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

  // Business logic methods
  public getLoyaltyTier(): string {
    return this._loyaltyPoints.getTierLevel();
  }

  public getDiscountPercentage(): number {
    return this._loyaltyPoints.getDiscountPercentage();
  }

  public isVipCustomer(): boolean {
    return this._totalVisits >= 10 || this._loyaltyPoints.value >= 1000;
  }

  public getDaysSinceLastVisit(): number | null {
    if (!this._lastVisit) return null;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this._lastVisit.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Validation
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Customer name is required', 'name');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('Customer name must be at least 2 characters', 'name');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('Customer name cannot exceed 100 characters', 'name');
    }
  }

  // Factory methods
  public static create(props: Omit<CustomerProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    return new Customer({
      id: props.id || crypto.randomUUID(), // In real app, use a proper ID generator
      name: props.name,
      email: props.email,
      phone: props.phone,
      whatsappId: props.whatsappId,
      avatar: props.avatar,
      loyaltyPoints: props.loyaltyPoints || LoyaltyPoints.zero(),
      totalVisits: props.totalVisits || 0,
      lastVisit: props.lastVisit,
      preferences: props.preferences,
      metadata: props.metadata,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this._name,
      email: this._email.value,
      phone: this._phone.value,
      whatsappId: this._whatsappId,
      avatar: this._avatar,
      loyaltyPoints: this._loyaltyPoints.value,
      totalVisits: this._totalVisits,
      lastVisit: this._lastVisit?.toISOString(),
      preferences: this._preferences,
      metadata: this._metadata,
      isActive: this._isActive,
      loyaltyTier: this.getLoyaltyTier(),
      discountPercentage: this.getDiscountPercentage(),
      isVip: this.isVipCustomer(),
      daysSinceLastVisit: this.getDaysSinceLastVisit(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
} 