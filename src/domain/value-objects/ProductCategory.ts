import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export const VALID_PRODUCT_CATEGORIES = [
  'HAIR_SERVICES',
  'NAIL_SERVICES', 
  'FACIAL_SERVICES',
  'BODY_SERVICES',
  'HAIR_PRODUCTS',
  'NAIL_PRODUCTS',
  'SKINCARE_PRODUCTS',
  'TOOLS_EQUIPMENT',
  'ACCESSORIES',
  'PACKAGES'
] as const;

export type ProductCategoryType = typeof VALID_PRODUCT_CATEGORIES[number];

export class ProductCategory extends ValueObject<ProductCategoryType> {
  protected validate(value: ProductCategoryType): void {
    if (!value) {
      throw new ValidationError('Product category is required');
    }
    
    if (!VALID_PRODUCT_CATEGORIES.includes(value)) {
      throw new ValidationError(
        `Invalid product category. Must be one of: ${VALID_PRODUCT_CATEGORIES.join(', ')}`
      );
    }
  }
  
  public static create(value: ProductCategoryType): ProductCategory {
    return new ProductCategory(value);
  }
  
  public static getValidCategories(): readonly ProductCategoryType[] {
    return VALID_PRODUCT_CATEGORIES;
  }
  
  public isServiceCategory(): boolean {
    return this.value.endsWith('_SERVICES');
  }
  
  public isProductCategory(): boolean {
    return this.value.endsWith('_PRODUCTS') || this.value === 'TOOLS_EQUIPMENT' || this.value === 'ACCESSORIES';
  }
  
  public isPackageCategory(): boolean {
    return this.value === 'PACKAGES';
  }
  
  public getDisplayName(): string {
    return this.value
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  public getSkuPrefix(): string {
    const prefixMap: Record<ProductCategoryType, string> = {
      'HAIR_SERVICES': 'HS',
      'NAIL_SERVICES': 'NS',
      'FACIAL_SERVICES': 'FS',
      'BODY_SERVICES': 'BS',
      'HAIR_PRODUCTS': 'HP',
      'NAIL_PRODUCTS': 'NP',
      'SKINCARE_PRODUCTS': 'SP',
      'TOOLS_EQUIPMENT': 'TE',
      'ACCESSORIES': 'AC',
      'PACKAGES': 'PK'
    };
    
    return prefixMap[this.value];
  }
} 