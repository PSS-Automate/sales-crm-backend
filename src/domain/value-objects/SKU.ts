import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export class SKU extends ValueObject<string> {
  private static readonly SKU_PATTERN = /^[A-Z]{2}-\d{3,6}$/;
  
  protected validate(value: string): void {
    if (!value) {
      throw new ValidationError('SKU is required');
    }
    
    if (!SKU.SKU_PATTERN.test(value)) {
      throw new ValidationError(
        'SKU must follow format: XX-### (e.g., HS-001, HP-1234)'
      );
    }
  }
  
  public static create(value: string): SKU {
    return new SKU(value.toUpperCase());
  }
  
  public static generate(categoryPrefix: string, sequence: number): SKU {
    if (!categoryPrefix || categoryPrefix.length !== 2) {
      throw new ValidationError('Category prefix must be exactly 2 characters');
    }
    
    if (sequence < 1 || sequence > 999999) {
      throw new ValidationError('Sequence number must be between 1 and 999999');
    }
    
    // Pad with leading zeros (minimum 3 digits)
    const paddedSequence = sequence.toString().padStart(3, '0');
    const skuValue = `${categoryPrefix.toUpperCase()}-${paddedSequence}`;
    
    return new SKU(skuValue);
  }
  
  public getCategoryPrefix(): string {
    return this.value.split('-')[0];
  }
  
  public getSequenceNumber(): number {
    return parseInt(this.value.split('-')[1], 10);
  }
  
  public isFromCategory(categoryPrefix: string): boolean {
    return this.getCategoryPrefix() === categoryPrefix.toUpperCase();
  }
  
  public getNextSKU(): SKU {
    const currentSequence = this.getSequenceNumber();
    const categoryPrefix = this.getCategoryPrefix();
    return SKU.generate(categoryPrefix, currentSequence + 1);
  }
  
  public static parseFromString(skuString: string): SKU {
    if (!skuString) {
      throw new ValidationError('SKU string cannot be empty');
    }
    
    return SKU.create(skuString);
  }
  
  public toDisplayString(): string {
    return this.value;
  }
} 