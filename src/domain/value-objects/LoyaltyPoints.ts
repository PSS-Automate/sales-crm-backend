import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError, BusinessRuleViolationError } from '@shared/errors/DomainError';

export class LoyaltyPoints extends ValueObject<number> {
  private static readonly MIN_POINTS = 0;
  private static readonly MAX_POINTS = 999999;
  
  // Salon business rules
  public static readonly POINTS_PER_DOLLAR = 1;
  public static readonly BONUS_THRESHOLD = 500;
  public static readonly BONUS_MULTIPLIER = 1.2;

  protected validate(value: number): void {
    if (typeof value !== 'number') {
      throw new ValidationError('Loyalty points must be a number', 'loyaltyPoints');
    }

    if (!Number.isInteger(value)) {
      throw new ValidationError('Loyalty points must be a whole number', 'loyaltyPoints');
    }

    if (value < LoyaltyPoints.MIN_POINTS) {
      throw new ValidationError(`Loyalty points cannot be negative`, 'loyaltyPoints');
    }

    if (value > LoyaltyPoints.MAX_POINTS) {
      throw new ValidationError(`Loyalty points cannot exceed ${LoyaltyPoints.MAX_POINTS}`, 'loyaltyPoints');
    }
  }

  public add(points: number): LoyaltyPoints {
    if (points < 0) {
      throw new BusinessRuleViolationError('Cannot add negative points');
    }

    const newValue = this._value + points;
    return new LoyaltyPoints(newValue);
  }

  public subtract(points: number): LoyaltyPoints {
    if (points < 0) {
      throw new BusinessRuleViolationError('Cannot subtract negative points');
    }

    if (this._value < points) {
      throw new BusinessRuleViolationError('Insufficient loyalty points');
    }

    const newValue = this._value - points;
    return new LoyaltyPoints(newValue);
  }

  public canRedeem(requiredPoints: number): boolean {
    return this._value >= requiredPoints;
  }

  public getTierLevel(): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (this._value >= 2000) return 'Platinum';
    if (this._value >= 1000) return 'Gold';
    if (this._value >= 500) return 'Silver';
    return 'Bronze';
  }

  public getDiscountPercentage(): number {
    const tier = this.getTierLevel();
    switch (tier) {
      case 'Platinum': return 0.15;  // 15% discount
      case 'Gold': return 0.10;      // 10% discount
      case 'Silver': return 0.05;    // 5% discount
      case 'Bronze': return 0;       // No discount
    }
  }

  public static fromAmount(dollarAmount: number): LoyaltyPoints {
    const points = Math.floor(dollarAmount * LoyaltyPoints.POINTS_PER_DOLLAR);
    return new LoyaltyPoints(points);
  }

  public static create(points: number): LoyaltyPoints {
    return new LoyaltyPoints(points);
  }

  public static zero(): LoyaltyPoints {
    return new LoyaltyPoints(0);
  }
} 