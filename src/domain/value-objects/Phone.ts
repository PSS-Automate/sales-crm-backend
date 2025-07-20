import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export class Phone extends ValueObject<string> {
  private static readonly PHONE_REGEX = /^[+]?[1-9]\d{1,14}$/;

  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('Phone number is required', 'phone');
    }

    // Remove common formatting characters for validation
    const cleanedPhone = this.cleanPhoneNumber(value);

    if (!Phone.PHONE_REGEX.test(cleanedPhone)) {
      throw new ValidationError('Invalid phone number format', 'phone');
    }

    if (cleanedPhone.length < 7) {
      throw new ValidationError('Phone number too short', 'phone');
    }

    if (cleanedPhone.length > 15) {
      throw new ValidationError('Phone number too long', 'phone');
    }
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove spaces, dashes, parentheses, and dots
    return phone.replace(/[\s\-\(\)\.\+]/g, '');
  }

  public getFormattedValue(): string {
    // Return the original value as provided (maintains user's preferred format)
    return this._value;
  }

  public getCleanValue(): string {
    // Return digits only for database storage or API calls
    return this.cleanPhoneNumber(this._value);
  }

  public getDisplayValue(): string {
    // Format for display in UI - can be customized based on country
    const clean = this.getCleanValue();
    
    // Simple formatting for demo - in real app, use libphonenumber
    if (clean.length === 10) {
      return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    
    return this._value; // Return original if can't format
  }

  public static create(phone: string): Phone {
    return new Phone(phone.trim());
  }
} 