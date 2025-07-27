import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

type PaymentTermsType = 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'IMMEDIATE' | 'PREPAID' | 'CUSTOM';

export interface CreditTermsProps {
  paymentTerms: PaymentTermsType;
  creditLimit: number;
  currentBalance: number;
  discountPercent: number;
  customTermsDays?: number;
  isActive: boolean;
}

export class CreditTerms extends ValueObject<CreditTermsProps> {
  protected validate(value: CreditTermsProps): void {
    if (!value) {
      throw new ValidationError('Credit terms data is required', 'creditTerms');
    }

    if (!value.paymentTerms) {
      throw new ValidationError('Payment terms are required', 'creditTerms.paymentTerms');
    }

    const validTerms: PaymentTermsType[] = ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'IMMEDIATE', 'PREPAID', 'CUSTOM'];
    if (!validTerms.includes(value.paymentTerms)) {
      throw new ValidationError(`Invalid payment terms. Must be one of: ${validTerms.join(', ')}`, 'creditTerms.paymentTerms');
    }

    if (value.paymentTerms === 'CUSTOM' && (!value.customTermsDays || value.customTermsDays <= 0)) {
      throw new ValidationError('Custom terms days must be provided and greater than 0 for CUSTOM payment terms', 'creditTerms.customTermsDays');
    }

    if (value.creditLimit < 0) {
      throw new ValidationError('Credit limit cannot be negative', 'creditTerms.creditLimit');
    }

    if (value.currentBalance < 0) {
      throw new ValidationError('Current balance cannot be negative', 'creditTerms.currentBalance');
    }

    if (value.currentBalance > value.creditLimit) {
      throw new ValidationError('Current balance cannot exceed credit limit', 'creditTerms.currentBalance');
    }

    if (value.discountPercent < 0 || value.discountPercent > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100', 'creditTerms.discountPercent');
    }

    if (typeof value.isActive !== 'boolean') {
      throw new ValidationError('Credit terms active status must be a boolean', 'creditTerms.isActive');
    }
  }

  public static create(props: CreditTermsProps): CreditTerms {
    return new CreditTerms(props);
  }

  public static immediate(): CreditTerms {
    return new CreditTerms({
      paymentTerms: 'IMMEDIATE',
      creditLimit: 0,
      currentBalance: 0,
      discountPercent: 0,
      isActive: true
    });
  }

  public static net30(creditLimit: number, discountPercent: number = 0): CreditTerms {
    return new CreditTerms({
      paymentTerms: 'NET_30',
      creditLimit,
      currentBalance: 0,
      discountPercent,
      isActive: true
    });
  }

  public static prepaid(): CreditTerms {
    return new CreditTerms({
      paymentTerms: 'PREPAID',
      creditLimit: 0,
      currentBalance: 0,
      discountPercent: 0,
      isActive: true
    });
  }

  public get paymentTerms(): PaymentTermsType {
    return this.value.paymentTerms;
  }

  public get creditLimit(): number {
    return this.value.creditLimit;
  }

  public get currentBalance(): number {
    return this.value.currentBalance;
  }

  public get availableCredit(): number {
    return this.value.creditLimit - this.value.currentBalance;
  }

  public get discountPercent(): number {
    return this.value.discountPercent;
  }

  public get customTermsDays(): number | undefined {
    return this.value.customTermsDays;
  }

  public get isActive(): boolean {
    return this.value.isActive;
  }

  public isOverLimit(): boolean {
    return this.value.currentBalance > this.value.creditLimit;
  }

  public isNearLimit(threshold: number = 0.9): boolean {
    return this.value.currentBalance >= (this.value.creditLimit * threshold);
  }

  public canProcessCharge(amount: number): boolean {
    if (!this.isActive) return false;
    if (this.paymentTerms === 'PREPAID' || this.paymentTerms === 'IMMEDIATE') return true;
    return (this.currentBalance + amount) <= this.creditLimit;
  }

  public addCharge(amount: number): CreditTerms {
    if (amount <= 0) {
      throw new ValidationError('Charge amount must be greater than 0', 'amount');
    }

    return CreditTerms.create({
      ...this.value,
      currentBalance: this.value.currentBalance + amount
    });
  }

  public processPayment(amount: number): CreditTerms {
    if (amount <= 0) {
      throw new ValidationError('Payment amount must be greater than 0', 'amount');
    }

    if (amount > this.value.currentBalance) {
      throw new ValidationError('Payment amount cannot exceed current balance', 'amount');
    }

    return CreditTerms.create({
      ...this.value,
      currentBalance: this.value.currentBalance - amount
    });
  }

  public updateCreditLimit(newLimit: number): CreditTerms {
    if (newLimit < 0) {
      throw new ValidationError('Credit limit cannot be negative', 'creditLimit');
    }

    return CreditTerms.create({
      ...this.value,
      creditLimit: newLimit
    });
  }

  public updateDiscountPercent(newDiscountPercent: number): CreditTerms {
    if (newDiscountPercent < 0 || newDiscountPercent > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100', 'discountPercent');
    }

    return CreditTerms.create({
      ...this.value,
      discountPercent: newDiscountPercent
    });
  }

  public suspend(): CreditTerms {
    return CreditTerms.create({
      ...this.value,
      isActive: false
    });
  }

  public reactivate(): CreditTerms {
    return CreditTerms.create({
      ...this.value,
      isActive: true
    });
  }

  public getPaymentDueDays(): number {
    switch (this.paymentTerms) {
      case 'NET_15': return 15;
      case 'NET_30': return 30;
      case 'NET_45': return 45;
      case 'NET_60': return 60;
      case 'IMMEDIATE': return 0;
      case 'PREPAID': return 0;
      case 'CUSTOM': return this.customTermsDays || 0;
      default: return 0;
    }
  }

  public getTermsDescription(): string {
    switch (this.paymentTerms) {
      case 'NET_15': return 'Net 15 Days';
      case 'NET_30': return 'Net 30 Days';
      case 'NET_45': return 'Net 45 Days';
      case 'NET_60': return 'Net 60 Days';
      case 'IMMEDIATE': return 'Payment Due Immediately';
      case 'PREPAID': return 'Prepaid Services Only';
      case 'CUSTOM': return `Net ${this.customTermsDays} Days`;
      default: return 'Unknown Terms';
    }
  }

  public getDisplayInfo(): Record<string, any> {
    return {
      paymentTerms: this.paymentTerms,
      creditLimit: this.creditLimit,
      currentBalance: this.currentBalance,
      availableCredit: this.availableCredit,
      discountPercent: this.discountPercent,
      customTermsDays: this.customTermsDays,
      isActive: this.isActive,
      termsDescription: this.getTermsDescription(),
      paymentDueDays: this.getPaymentDueDays()
    };
  }
} 