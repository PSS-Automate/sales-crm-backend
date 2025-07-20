// Request DTOs
export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  whatsappId?: string;
  avatar?: string;
  preferences?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  whatsappId?: string;
  avatar?: string;
  preferences?: string;
}

export interface CustomerSearchDto {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  phone?: string;
  whatsappId?: string;
  isActive?: boolean;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  lastVisitAfter?: string; // ISO date string
  lastVisitBefore?: string; // ISO date string
}

// Response DTOs
export interface CustomerResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappId?: string;
  avatar?: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  discountPercentage: number;
  totalVisits: number;
  lastVisit?: string; // ISO date string
  preferences?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  isVip: boolean;
  daysSinceLastVisit?: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CustomerListResponseDto {
  customers: CustomerResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AddLoyaltyPointsDto {
  points: number;
  reason?: string;
}

export interface RedeemLoyaltyPointsDto {
  points: number;
  reason?: string;
} 