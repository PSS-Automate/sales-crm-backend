import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('Email is required', 'email');
    }

    if (!Email.EMAIL_REGEX.test(value)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    // Salon-specific validation: check for common typos
    if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
      throw new ValidationError('Email contains invalid dots', 'email');
    }

    if (value.length > 254) {
      throw new ValidationError('Email too long (max 254 characters)', 'email');
    }
  }

  public getDomain(): string {
    return this._value.split('@')[1];
  }

  public getLocalPart(): string {
    return this._value.split('@')[0];
  }

  public static create(email: string): Email {
    return new Email(email.toLowerCase().trim());
  }
} 