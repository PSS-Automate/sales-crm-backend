import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export const VALID_PRODUCT_TYPES = [
  'SERVICE',
  'PHYSICAL_PRODUCT', 
  'PACKAGE'
] as const;

export type ProductTypeValue = typeof VALID_PRODUCT_TYPES[number];

export class ProductType extends ValueObject<ProductTypeValue> {
  protected validate(value: ProductTypeValue): void {
    if (!value) {
      throw new ValidationError('Product type is required');
    }
    
    if (!VALID_PRODUCT_TYPES.includes(value)) {
      throw new ValidationError(
        `Invalid product type. Must be one of: ${VALID_PRODUCT_TYPES.join(', ')}`
      );
    }
  }
  
  public static create(value: ProductTypeValue): ProductType {
    return new ProductType(value);
  }
  
  public static getValidTypes(): readonly ProductTypeValue[] {
    return VALID_PRODUCT_TYPES;
  }
  
  public isService(): boolean {
    return this.value === 'SERVICE';
  }
  
  public isPhysicalProduct(): boolean {
    return this.value === 'PHYSICAL_PRODUCT';
  }
  
  public isPackage(): boolean {
    return this.value === 'PACKAGE';
  }
  
  public requiresDuration(): boolean {
    return this.isService() || this.isPackage();
  }
  
  public requiresInventory(): boolean {
    return this.isPhysicalProduct();
  }
  
  public getDisplayName(): string {
    const displayNames: Record<ProductTypeValue, string> = {
      'SERVICE': 'Service',
      'PHYSICAL_PRODUCT': 'Physical Product',
      'PACKAGE': 'Package'
    };
    
    return displayNames[this.value];
  }
  
  public getDescription(): string {
    const descriptions: Record<ProductTypeValue, string> = {
      'SERVICE': 'A service performed by salon staff (e.g., haircut, massage)',
      'PHYSICAL_PRODUCT': 'A physical item sold to customers (e.g., shampoo, tools)',
      'PACKAGE': 'A bundle of services or products offered at a discounted price'
    };
    
    return descriptions[this.value];
  }
} 