import { IRepository, FindAllOptions, PaginatedResult } from '@shared/interfaces/IRepository';
import { Customer } from '../entities/Customer';
import { Email, Phone } from '../value-objects';

export interface CustomerSearchOptions extends FindAllOptions {
  email?: string;
  phone?: string;
  whatsappId?: string;
  isActive?: boolean;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  lastVisitAfter?: Date;
  lastVisitBefore?: Date;
}

export interface ICustomerRepository extends IRepository<Customer, string> {
  // Base methods inherited:
  // findById(id: string): Promise<Customer | null>;
  // findAll(options?: FindAllOptions): Promise<PaginatedResult<Customer>>;
  // create(customer: Customer): Promise<Customer>;
  // update(id: string, customer: Partial<Customer>): Promise<Customer>;
  // delete(id: string): Promise<void>;
  // exists(id: string): Promise<boolean>;

  // Customer-specific methods
  findByEmail(email: Email): Promise<Customer | null>;
  findByPhone(phone: Phone): Promise<Customer | null>;
  findByWhatsappId(whatsappId: string): Promise<Customer | null>;
  
  // Advanced search
  search(options: CustomerSearchOptions): Promise<PaginatedResult<Customer>>;
  
  // Business query methods
  findVipCustomers(options?: FindAllOptions): Promise<PaginatedResult<Customer>>;
  findInactiveCustomers(daysSinceLastVisit: number, options?: FindAllOptions): Promise<PaginatedResult<Customer>>;
  findByLoyaltyTier(tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum', options?: FindAllOptions): Promise<PaginatedResult<Customer>>;
  
  // Analytics methods
  getTotalCustomerCount(): Promise<number>;
  getActiveCustomerCount(): Promise<number>;
  getAverageLoyaltyPoints(): Promise<number>;
  getCustomersByRegistrationMonth(year: number, month: number): Promise<Customer[]>;
} 