import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export class Price extends ValueObject<number> {
  protected validate(value: number): void {
    if (typeof value !== 'number') {
      throw new ValidationError('Price must be a number');
    }
    
    if (value <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }
    
    if (value > 999999.99) {
      throw new ValidationError('Price cannot exceed $999,999.99');
    }
    
    // Check for more than 2 decimal places
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new ValidationError('Price cannot have more than 2 decimal places');
    }
  }
  
  public static create(value: number): Price {
    return new Price(value);
  }
  
  public toCurrency(): string {
    return `$${this.value.toFixed(2)}`;
  }
  
  public applyDiscount(discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100');
    }
    
    const discountAmount = this.value * (discountPercent / 100);
    const discountedPrice = this.value - discountAmount;
    
    return Price.create(Math.round(discountedPrice * 100) / 100); // Round to 2 decimal places
  }
  
  public add(otherPrice: Price): Price {
    return Price.create(this.value + otherPrice.value);
  }
  
  public multiply(factor: number): Price {
    if (factor < 0) {
      throw new ValidationError('Price multiplication factor must be positive');
    }
    
    const result = this.value * factor;
    return Price.create(Math.round(result * 100) / 100); // Round to 2 decimal places
  }
  
  public isGreaterThan(otherPrice: Price): boolean {
    return this.value > otherPrice.value;
  }
  
  public isLessThan(otherPrice: Price): boolean {
    return this.value < otherPrice.value;
  }
} 