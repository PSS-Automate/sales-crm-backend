import { IRepository } from '@shared/interfaces/IRepository';
import { Client } from '../entities/Client';
import { BusinessType } from '../value-objects/BusinessType';

export interface FindClientOptions {
  businessType?: BusinessType;
  isActive?: boolean;
  hasActiveContract?: boolean;
  creditOverLimit?: boolean;
  contractExpiring?: boolean;
  expiringDays?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IClientRepository extends IRepository<Client, string> {
  // Entity-specific search methods
  findByCompanyName(companyName: string): Promise<Client | null>;
  findByRegistrationNumber(registrationNumber: string): Promise<Client | null>;
  findByTaxId(taxId: string): Promise<Client | null>;
  findByContactEmail(email: string): Promise<Client | null>;
  
  // Business query methods
  findActiveClients(options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  findByBusinessType(businessType: BusinessType, options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  findClientsWithActiveContracts(options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  findExpiringContracts(daysAhead?: number, options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  findClientsOverCreditLimit(options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  findClientsNearCreditLimit(threshold?: number, options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  
  // Advanced filtering
  findByFilters(filters: FindClientOptions, options?: FindAllOptions): Promise<PaginatedResult<Client>>;
  
  // Business intelligence methods
  getTotalActiveClients(): Promise<number>;
  getTotalCreditOutstanding(): Promise<number>;
  getClientsWithBalanceByBusinessType(): Promise<Array<{ businessType: string; count: number; totalBalance: number }>>;
  getContractExpiryReport(daysAhead?: number): Promise<Array<{ client: Client; daysUntilExpiry: number }>>;
} 