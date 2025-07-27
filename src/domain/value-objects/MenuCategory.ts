import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

type MenuCategoryValue = 
  | 'HAIR_SERVICES'
  | 'NAIL_SERVICES' 
  | 'FACIAL_SERVICES'
  | 'BODY_TREATMENTS'
  | 'MASSAGE_THERAPY'
  | 'BRIDAL_PACKAGES'
  | 'SPECIAL_OCCASIONS'
  | 'WELLNESS_PACKAGES'
  | 'SEASONAL_OFFERS'
  | 'MEMBERSHIP_PLANS'
  | 'ADD_ON_SERVICES'
  | 'GIFT_PACKAGES';

export class MenuCategory extends ValueObject<MenuCategoryValue> {
  private static readonly VALID_CATEGORIES: MenuCategoryValue[] = [
    'HAIR_SERVICES',
    'NAIL_SERVICES',
    'FACIAL_SERVICES',
    'BODY_TREATMENTS',
    'MASSAGE_THERAPY',
    'BRIDAL_PACKAGES',
    'SPECIAL_OCCASIONS',
    'WELLNESS_PACKAGES',
    'SEASONAL_OFFERS',
    'MEMBERSHIP_PLANS',
    'ADD_ON_SERVICES',
    'GIFT_PACKAGES'
  ];

  protected validate(value: MenuCategoryValue): void {
    if (!value) {
      throw new ValidationError('Menu category is required', 'menuCategory');
    }

    if (!MenuCategory.VALID_CATEGORIES.includes(value)) {
      throw new ValidationError(
        `Invalid menu category. Must be one of: ${MenuCategory.VALID_CATEGORIES.join(', ')}`,
        'menuCategory'
      );
    }
  }

  public static create(value: MenuCategoryValue): MenuCategory {
    return new MenuCategory(value);
  }

  // Factory methods for common categories
  public static hairServices(): MenuCategory {
    return new MenuCategory('HAIR_SERVICES');
  }

  public static nailServices(): MenuCategory {
    return new MenuCategory('NAIL_SERVICES');
  }

  public static facialServices(): MenuCategory {
    return new MenuCategory('FACIAL_SERVICES');
  }

  public static bodyTreatments(): MenuCategory {
    return new MenuCategory('BODY_TREATMENTS');
  }

  public static massageTherapy(): MenuCategory {
    return new MenuCategory('MASSAGE_THERAPY');
  }

  public static bridalPackages(): MenuCategory {
    return new MenuCategory('BRIDAL_PACKAGES');
  }

  public static specialOccasions(): MenuCategory {
    return new MenuCategory('SPECIAL_OCCASIONS');
  }

  public static wellnessPackages(): MenuCategory {
    return new MenuCategory('WELLNESS_PACKAGES');
  }

  public static seasonalOffers(): MenuCategory {
    return new MenuCategory('SEASONAL_OFFERS');
  }

  public static membershipPlans(): MenuCategory {
    return new MenuCategory('MEMBERSHIP_PLANS');
  }

  public static addOnServices(): MenuCategory {
    return new MenuCategory('ADD_ON_SERVICES');
  }

  public static giftPackages(): MenuCategory {
    return new MenuCategory('GIFT_PACKAGES');
  }

  // Business logic methods
  public isPackage(): boolean {
    return this.value === 'BRIDAL_PACKAGES' || 
           this.value === 'WELLNESS_PACKAGES' || 
           this.value === 'GIFT_PACKAGES';
  }

  public isSeasonalOffering(): boolean {
    return this.value === 'SEASONAL_OFFERS' || 
           this.value === 'SPECIAL_OCCASIONS';
  }

  public isIndividualService(): boolean {
    return this.value === 'HAIR_SERVICES' || 
           this.value === 'NAIL_SERVICES' || 
           this.value === 'FACIAL_SERVICES' || 
           this.value === 'BODY_TREATMENTS' || 
           this.value === 'MASSAGE_THERAPY' ||
           this.value === 'ADD_ON_SERVICES';
  }

  public isMembership(): boolean {
    return this.value === 'MEMBERSHIP_PLANS';
  }

  public requiresAdvanceBooking(): boolean {
    return this.value === 'BRIDAL_PACKAGES' || 
           this.value === 'SPECIAL_OCCASIONS' ||
           this.value === 'WELLNESS_PACKAGES';
  }

  public getDisplayName(): string {
    const displayNames: Record<MenuCategoryValue, string> = {
      'HAIR_SERVICES': 'Hair Services',
      'NAIL_SERVICES': 'Nail Services',
      'FACIAL_SERVICES': 'Facial Services',
      'BODY_TREATMENTS': 'Body Treatments',
      'MASSAGE_THERAPY': 'Massage Therapy',
      'BRIDAL_PACKAGES': 'Bridal Packages',
      'SPECIAL_OCCASIONS': 'Special Occasions',
      'WELLNESS_PACKAGES': 'Wellness Packages',
      'SEASONAL_OFFERS': 'Seasonal Offers',
      'MEMBERSHIP_PLANS': 'Membership Plans',
      'ADD_ON_SERVICES': 'Add-On Services',
      'GIFT_PACKAGES': 'Gift Packages'
    };

    return displayNames[this.value];
  }

  public getDescription(): string {
    const descriptions: Record<MenuCategoryValue, string> = {
      'HAIR_SERVICES': 'Professional hair cutting, styling, coloring, and treatment services',
      'NAIL_SERVICES': 'Manicure, pedicure, nail art, and nail care treatments',
      'FACIAL_SERVICES': 'Deep cleansing, anti-aging, and specialized facial treatments',
      'BODY_TREATMENTS': 'Body wraps, scrubs, and therapeutic body treatments',
      'MASSAGE_THERAPY': 'Relaxation and therapeutic massage services',
      'BRIDAL_PACKAGES': 'Complete beauty packages for weddings and special events',
      'SPECIAL_OCCASIONS': 'Styling services for parties, proms, and special events',
      'WELLNESS_PACKAGES': 'Comprehensive wellness and relaxation packages',
      'SEASONAL_OFFERS': 'Limited-time seasonal promotions and packages',
      'MEMBERSHIP_PLANS': 'Monthly membership plans with exclusive benefits',
      'ADD_ON_SERVICES': 'Complementary services to enhance your main treatment',
      'GIFT_PACKAGES': 'Perfect gift packages for loved ones'
    };

    return descriptions[this.value];
  }

  public static getAllCategories(): MenuCategoryValue[] {
    return [...MenuCategory.VALID_CATEGORIES];
  }

  public static getIndividualServiceCategories(): MenuCategoryValue[] {
    return [
      'HAIR_SERVICES',
      'NAIL_SERVICES',
      'FACIAL_SERVICES',
      'BODY_TREATMENTS',
      'MASSAGE_THERAPY',
      'ADD_ON_SERVICES'
    ];
  }

  public static getPackageCategories(): MenuCategoryValue[] {
    return [
      'BRIDAL_PACKAGES',
      'WELLNESS_PACKAGES',
      'GIFT_PACKAGES'
    ];
  }
} 