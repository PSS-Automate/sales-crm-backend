import { Entity } from '@shared/base-classes/Entity';
import { ValidationError, BusinessRuleViolationError } from '@shared/errors/DomainError';
import { Email, Phone, BusinessType, ContactPerson, CreditTerms } from '../value-objects';

export interface ClientProps {
  id: string;
  companyName: string;
  businessType: BusinessType;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  primaryContact: ContactPerson;
  secondaryContacts: ContactPerson[];
  billingAddress: string;
  shippingAddress?: string;
  creditTerms: CreditTerms;
  contractStartDate?: Date;
  contractEndDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Client extends Entity<string> {
  private _companyName: string;
  private _businessType: BusinessType;
  private _registrationNumber?: string;
  private _taxId?: string;
  private _website?: string;
  private _primaryContact: ContactPerson;
  private _secondaryContacts: ContactPerson[];
  private _billingAddress: string;
  private _shippingAddress?: string;
  private _creditTerms: CreditTerms;
  private _contractStartDate?: Date;
  private _contractEndDate?: Date;
  private _notes?: string;
  private _metadata?: Record<string, any>;
  private _isActive: boolean;

  constructor(props: ClientProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });

    this.validateCompanyName(props.companyName);
    this.validateBillingAddress(props.billingAddress);
    this.validateContractDates(props.contractStartDate, props.contractEndDate);
    this.validatePrimaryContact(props.primaryContact, props.secondaryContacts);

    this._companyName = props.companyName;
    this._businessType = props.businessType;
    this._registrationNumber = props.registrationNumber;
    this._taxId = props.taxId;
    this._website = props.website;
    this._primaryContact = props.primaryContact;
    this._secondaryContacts = props.secondaryContacts || [];
    this._billingAddress = props.billingAddress;
    this._shippingAddress = props.shippingAddress;
    this._creditTerms = props.creditTerms;
    this._contractStartDate = props.contractStartDate;
    this._contractEndDate = props.contractEndDate;
    this._notes = props.notes;
    this._metadata = props.metadata;
    this._isActive = props.isActive ?? true;
  }

  // Getters
  public get companyName(): string { return this._companyName; }
  public get businessType(): BusinessType { return this._businessType; }
  public get registrationNumber(): string | undefined { return this._registrationNumber; }
  public get taxId(): string | undefined { return this._taxId; }
  public get website(): string | undefined { return this._website; }
  public get primaryContact(): ContactPerson { return this._primaryContact; }
  public get secondaryContacts(): ContactPerson[] { return [...this._secondaryContacts]; }
  public get billingAddress(): string { return this._billingAddress; }
  public get shippingAddress(): string | undefined { return this._shippingAddress; }
  public get creditTerms(): CreditTerms { return this._creditTerms; }
  public get contractStartDate(): Date | undefined { return this._contractStartDate; }
  public get contractEndDate(): Date | undefined { return this._contractEndDate; }
  public get notes(): string | undefined { return this._notes; }
  public get metadata(): Record<string, any> | undefined { return this._metadata; }
  public get isActive(): boolean { return this._isActive; }

  // Business methods
  public updateCompanyName(newName: string): void {
    this.validateCompanyName(newName);
    this._companyName = newName;
    this.touch();
  }

  public updateBusinessType(newType: BusinessType): void {
    this._businessType = newType;
    this.touch();
  }

  public updatePrimaryContact(newContact: ContactPerson): void {
    this.validatePrimaryContact(newContact, this._secondaryContacts);
    this._primaryContact = newContact;
    this.touch();
  }

  public addSecondaryContact(contact: ContactPerson): void {
    if (this._secondaryContacts.length >= 5) {
      throw new BusinessRuleViolationError('Cannot have more than 5 secondary contacts');
    }

    // Ensure only one primary contact exists
    if (contact.isPrimary) {
      throw new BusinessRuleViolationError('Secondary contact cannot be marked as primary');
    }

    // Check for duplicate emails
    const existingEmails = [
      this._primaryContact.email.toString(),
      ...this._secondaryContacts.map(c => c.email.toString())
    ];

    if (existingEmails.includes(contact.email.toString())) {
      throw new BusinessRuleViolationError('Contact email already exists');
    }

    this._secondaryContacts.push(contact);
    this.touch();
  }

  public removeSecondaryContact(contactEmail: string): void {
    const index = this._secondaryContacts.findIndex(c => c.email.toString() === contactEmail);
    if (index === -1) {
      throw new ValidationError('Secondary contact not found', 'secondaryContacts');
    }

    this._secondaryContacts.splice(index, 1);
    this.touch();
  }

  public updateSecondaryContact(contactEmail: string, updatedContact: ContactPerson): void {
    const index = this._secondaryContacts.findIndex(c => c.email.toString() === contactEmail);
    if (index === -1) {
      throw new ValidationError('Secondary contact not found', 'secondaryContacts');
    }

    if (updatedContact.isPrimary) {
      throw new BusinessRuleViolationError('Secondary contact cannot be marked as primary');
    }

    this._secondaryContacts[index] = updatedContact;
    this.touch();
  }

  public updateCreditTerms(newTerms: CreditTerms): void {
    this._creditTerms = newTerms;
    this.touch();
  }

  public addCharge(amount: number): void {
    if (!this._creditTerms.canProcessCharge(amount)) {
      throw new BusinessRuleViolationError('Charge exceeds credit limit or credit terms not active');
    }

    this._creditTerms = this._creditTerms.addCharge(amount);
    this.touch();
  }

  public processPayment(amount: number): void {
    this._creditTerms = this._creditTerms.processPayment(amount);
    this.touch();
  }

  public extendContract(newEndDate: Date): void {
    this.validateContractDates(this._contractStartDate, newEndDate);
    this._contractEndDate = newEndDate;
    this.touch();
  }

  public updateBillingAddress(newAddress: string): void {
    this.validateBillingAddress(newAddress);
    this._billingAddress = newAddress;
    this.touch();
  }

  public updateShippingAddress(newAddress: string): void {
    this._shippingAddress = newAddress.trim();
    this.touch();
  }

  public updateNotes(newNotes: string): void {
    this._notes = newNotes?.trim();
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public reactivate(): void {
    this._isActive = true;
    this.touch();
  }

  // Business queries
  public getAllContacts(): ContactPerson[] {
    return [this._primaryContact, ...this._secondaryContacts];
  }

  public getContactByEmail(email: string): ContactPerson | null {
    const allContacts = this.getAllContacts();
    return allContacts.find(c => c.email.toString() === email) || null;
  }

  public hasActiveContract(): boolean {
    if (!this._contractStartDate || !this._contractEndDate) return false;
    const now = new Date();
    return now >= this._contractStartDate && now <= this._contractEndDate;
  }

  public isContractExpiring(daysAhead: number = 30): boolean {
    if (!this._contractEndDate) return false;
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    return this._contractEndDate <= expiryThreshold && this._contractEndDate >= now;
  }

  public canProcessCharge(amount: number): boolean {
    return this._isActive && this._creditTerms.canProcessCharge(amount);
  }

  public getAvailableCredit(): number {
    return this._creditTerms.availableCredit;
  }

  public getCurrentBalance(): number {
    return this._creditTerms.currentBalance;
  }

  public getDiscountPercent(): number {
    return this._creditTerms.discountPercent;
  }

  // Validation methods
  private validateCompanyName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Company name is required', 'companyName');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('Company name must be at least 2 characters', 'companyName');
    }

    if (name.trim().length > 200) {
      throw new ValidationError('Company name cannot exceed 200 characters', 'companyName');
    }
  }

  private validateBillingAddress(address: string): void {
    if (!address || address.trim().length === 0) {
      throw new ValidationError('Billing address is required', 'billingAddress');
    }

    if (address.trim().length < 10) {
      throw new ValidationError('Billing address must be at least 10 characters', 'billingAddress');
    }

    if (address.trim().length > 500) {
      throw new ValidationError('Billing address cannot exceed 500 characters', 'billingAddress');
    }
  }

  private validateContractDates(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && startDate >= endDate) {
      throw new ValidationError('Contract start date must be before end date', 'contractDates');
    }

    if (endDate && endDate < new Date()) {
      throw new ValidationError('Contract end date cannot be in the past', 'contractEndDate');
    }
  }

  private validatePrimaryContact(primaryContact: ContactPerson, secondaryContacts: ContactPerson[]): void {
    if (!primaryContact.isPrimary) {
      throw new ValidationError('Primary contact must be marked as primary', 'primaryContact');
    }

    // Check for duplicate emails between primary and secondary contacts
    const secondaryEmails = secondaryContacts.map(c => c.email.toString());
    if (secondaryEmails.includes(primaryContact.email.toString())) {
      throw new BusinessRuleViolationError('Primary contact email cannot match secondary contact email');
    }
  }

  // Factory method
  public static create(props: Omit<ClientProps, 'id' | 'createdAt' | 'updatedAt'>): Client {
    return new Client({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...props
    });
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      companyName: this._companyName,
      businessType: this._businessType.toString(),
      registrationNumber: this._registrationNumber,
      taxId: this._taxId,
      website: this._website,
      primaryContact: this._primaryContact.toJSON(),
      secondaryContacts: this._secondaryContacts.map(c => c.toJSON()),
      billingAddress: this._billingAddress,
      shippingAddress: this._shippingAddress,
      creditTerms: this._creditTerms.getDisplayInfo(),
      contractStartDate: this._contractStartDate?.toISOString(),
      contractEndDate: this._contractEndDate?.toISOString(),
      notes: this._notes,
      metadata: this._metadata,
      isActive: this._isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      hasActiveContract: this.hasActiveContract(),
      availableCredit: this.getAvailableCredit(),
      currentBalance: this.getCurrentBalance()
    };
  }
} 