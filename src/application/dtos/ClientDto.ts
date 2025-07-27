// Request DTOs
export interface CreateClientRequestDto {
  companyName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  primaryContact: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  secondaryContacts?: Array<{
    name: string;
    position: string;
    email: string;
    phone: string;
  }>;
  billingAddress: string;
  shippingAddress?: string;
  creditTerms: {
    paymentTerms: string;
    creditLimit: number;
    discountPercent: number;
    customTermsDays?: number;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateClientRequestDto {
  companyName?: string;
  businessType?: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  billingAddress?: string;
  shippingAddress?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateClientContactRequestDto {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface UpdateClientCreditTermsRequestDto {
  paymentTerms: string;
  creditLimit: number;
  discountPercent: number;
  customTermsDays?: number;
}

export interface ExtendClientContractRequestDto {
  contractEndDate: string;
}

export interface ProcessClientChargeRequestDto {
  amount: number;
  description?: string;
}

export interface ProcessClientPaymentRequestDto {
  amount: number;
  reference?: string;
}

// Response DTOs
export interface ClientContactResponseDto {
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ClientCreditTermsResponseDto {
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  discountPercent: number;
  customTermsDays?: number;
  isActive: boolean;
  termsDescription: string;
  paymentDueDays: number;
}

export interface ClientResponseDto {
  id: string;
  companyName: string;
  businessType: string;
  businessTypeDisplay: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  primaryContact: ClientContactResponseDto;
  secondaryContacts: ClientContactResponseDto[];
  billingAddress: string;
  shippingAddress?: string;
  creditTerms: ClientCreditTermsResponseDto;
  contractStartDate?: string;
  contractEndDate?: string;
  hasActiveContract: boolean;
  isContractExpiring: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSummaryResponseDto {
  id: string;
  companyName: string;
  businessType: string;
  businessTypeDisplay: string;
  primaryContactName: string;
  primaryContactEmail: string;
  currentBalance: number;
  availableCredit: number;
  hasActiveContract: boolean;
  isActive: boolean;
}

export interface ClientListResponseDto {
  clients: ClientSummaryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter DTOs
export interface GetClientsFilterDto {
  businessType?: string;
  isActive?: boolean;
  hasActiveContract?: boolean;
  creditOverLimit?: boolean;
  contractExpiring?: boolean;
  expiringDays?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Report DTOs
export interface ClientBusinessReportDto {
  businessType: string;
  clientCount: number;
  totalBalance: number;
  averageBalance: number;
}

export interface ContractExpiryReportDto {
  client: ClientSummaryResponseDto;
  contractEndDate: string;
  daysUntilExpiry: number;
  isExpired: boolean;
}

export interface ClientCreditReportDto {
  totalClients: number;
  totalCreditOutstanding: number;
  clientsOverLimit: number;
  clientsNearLimit: number;
  averageCreditUtilization: number;
  businessTypeBreakdown: ClientBusinessReportDto[];
} 