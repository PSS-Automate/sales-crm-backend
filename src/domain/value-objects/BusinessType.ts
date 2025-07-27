import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

type BusinessTypeValue = 
  | 'CORPORATE' 
  | 'SALON_CHAIN' 
  | 'HOTEL_SPA' 
  | 'WEDDING_PLANNER' 
  | 'EVENT_ORGANIZER' 
  | 'BEAUTY_SCHOOL' 
  | 'FRANCHISE' 
  | 'WHOLESALER' 
  | 'OTHER';

export class BusinessType extends ValueObject<BusinessTypeValue> {
  private static readonly VALID_TYPES: BusinessTypeValue[] = [
    'CORPORATE',
    'SALON_CHAIN', 
    'HOTEL_SPA',
    'WEDDING_PLANNER',
    'EVENT_ORGANIZER',
    'BEAUTY_SCHOOL',
    'FRANCHISE',
    'WHOLESALER',
    'OTHER'
  ];

  protected validate(value: BusinessTypeValue): void {
    if (!value) {
      throw new ValidationError('Business type is required', 'businessType');
    }
    
    if (!BusinessType.VALID_TYPES.includes(value)) {
      throw new ValidationError(
        `Invalid business type. Must be one of: ${BusinessType.VALID_TYPES.join(', ')}`,
        'businessType'
      );
    }
  }

  public static create(value: BusinessTypeValue): BusinessType {
    return new BusinessType(value);
  }

  public static corporate(): BusinessType {
    return new BusinessType('CORPORATE');
  }

  public static salonChain(): BusinessType {
    return new BusinessType('SALON_CHAIN');
  }

  public static hotelSpa(): BusinessType {
    return new BusinessType('HOTEL_SPA');
  }

  public static weddingPlanner(): BusinessType {
    return new BusinessType('WEDDING_PLANNER');
  }

  public static eventOrganizer(): BusinessType {
    return new BusinessType('EVENT_ORGANIZER');
  }

  public static beautySchool(): BusinessType {
    return new BusinessType('BEAUTY_SCHOOL');
  }

  public static franchise(): BusinessType {
    return new BusinessType('FRANCHISE');
  }

  public static wholesaler(): BusinessType {
    return new BusinessType('WHOLESALER');
  }

  public static other(): BusinessType {
    return new BusinessType('OTHER');
  }

  public isCorporate(): boolean {
    return this.value === 'CORPORATE';
  }

  public isEducational(): boolean {
    return this.value === 'BEAUTY_SCHOOL';
  }

  public isEvent(): boolean {
    return this.value === 'WEDDING_PLANNER' || this.value === 'EVENT_ORGANIZER';
  }

  public isRetail(): boolean {
    return this.value === 'SALON_CHAIN' || this.value === 'FRANCHISE' || this.value === 'WHOLESALER';
  }

  public getDisplayName(): string {
    const displayNames: Record<BusinessTypeValue, string> = {
      'CORPORATE': 'Corporate Client',
      'SALON_CHAIN': 'Salon Chain',
      'HOTEL_SPA': 'Hotel & Spa',
      'WEDDING_PLANNER': 'Wedding Planner',
      'EVENT_ORGANIZER': 'Event Organizer',
      'BEAUTY_SCHOOL': 'Beauty School',
      'FRANCHISE': 'Franchise',
      'WHOLESALER': 'Wholesaler',
      'OTHER': 'Other Business'
    };
    
    return displayNames[this.value];
  }

  public static getAllTypes(): BusinessTypeValue[] {
    return [...BusinessType.VALID_TYPES];
  }
} 