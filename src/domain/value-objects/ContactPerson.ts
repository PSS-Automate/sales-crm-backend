import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';
import { Email } from './Email';
import { Phone } from './Phone';

export interface ContactPersonProps {
  name: string;
  position: string;
  email: Email;
  phone: Phone;
  isPrimary: boolean;
}

export class ContactPerson extends ValueObject<ContactPersonProps> {
  protected validate(value: ContactPersonProps): void {
    if (!value) {
      throw new ValidationError('Contact person data is required', 'contactPerson');
    }

    if (!value.name || value.name.trim().length === 0) {
      throw new ValidationError('Contact person name is required', 'contactPerson.name');
    }

    if (value.name.trim().length < 2) {
      throw new ValidationError('Contact person name must be at least 2 characters', 'contactPerson.name');
    }

    if (value.name.trim().length > 100) {
      throw new ValidationError('Contact person name cannot exceed 100 characters', 'contactPerson.name');
    }

    if (!value.position || value.position.trim().length === 0) {
      throw new ValidationError('Contact person position is required', 'contactPerson.position');
    }

    if (value.position.trim().length > 50) {
      throw new ValidationError('Contact person position cannot exceed 50 characters', 'contactPerson.position');
    }

    if (!value.email) {
      throw new ValidationError('Contact person email is required', 'contactPerson.email');
    }

    if (!value.phone) {
      throw new ValidationError('Contact person phone is required', 'contactPerson.phone');
    }

    if (typeof value.isPrimary !== 'boolean') {
      throw new ValidationError('Contact person isPrimary must be a boolean', 'contactPerson.isPrimary');
    }
  }

  public static create(props: ContactPersonProps): ContactPerson {
    const normalizedProps = {
      ...props,
      name: props.name.trim(),
      position: props.position.trim()
    };
    
    return new ContactPerson(normalizedProps);
  }

  public get name(): string {
    return this.value.name;
  }

  public get position(): string {
    return this.value.position;
  }

  public get email(): Email {
    return this.value.email;
  }

  public get phone(): Phone {
    return this.value.phone;
  }

  public get isPrimary(): boolean {
    return this.value.isPrimary;
  }

  public makePrimary(): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      isPrimary: true
    });
  }

  public makeSecondary(): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      isPrimary: false
    });
  }

  public updateName(newName: string): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      name: newName
    });
  }

  public updatePosition(newPosition: string): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      position: newPosition
    });
  }

  public updateEmail(newEmail: Email): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      email: newEmail
    });
  }

  public updatePhone(newPhone: Phone): ContactPerson {
    return ContactPerson.create({
      ...this.value,
      phone: newPhone
    });
  }

  public getFullContact(): string {
    return `${this.name} (${this.position}) - ${this.email.toString()} - ${this.phone.toString()}`;
  }
} 