// Request DTOs
export interface CreateMenuItemRequestDto {
  name: string;
  description: string;
  category: string;
  duration: number; // minutes
  price: number;
  isPackage?: boolean;
  includedServices?: string[];
  requirements?: string[];
  benefits?: string[];
  advanceBookingRequired?: boolean;
  advanceBookingDays?: number;
  availableOnline?: boolean;
  displayOrder?: number;
  imageUrl?: string;
  tags?: string[];
  seasonalItem?: boolean;
  validFrom?: string; // ISO date string
  validTo?: string; // ISO date string
  maxBookingsPerDay?: number;
  metadata?: Record<string, any>;
}

export interface UpdateMenuItemRequestDto {
  name?: string;
  description?: string;
  category?: string;
  duration?: number; // minutes
  price?: number;
  advanceBookingRequired?: boolean;
  advanceBookingDays?: number;
  availableOnline?: boolean;
  displayOrder?: number;
  imageUrl?: string;
  seasonalItem?: boolean;
  validFrom?: string; // ISO date string
  validTo?: string; // ISO date string
  maxBookingsPerDay?: number;
  metadata?: Record<string, any>;
}

export interface MenuItemServicesRequestDto {
  includedServices?: string[];
  requirements?: string[];
  benefits?: string[];
}

export interface MenuItemTagsRequestDto {
  tags: string[];
}

export interface ReorderMenuItemsRequestDto {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}

// Response DTOs
export interface MenuItemResponseDto {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryDisplay: string;
  duration: number; // minutes
  durationDisplay: string;
  price: number;
  priceDisplay: string;
  isPackage: boolean;
  includedServices: string[];
  requirements: string[];
  benefits: string[];
  advanceBookingRequired: boolean;
  advanceBookingDays?: number;
  availableOnline: boolean;
  canBookOnline: boolean;
  displayOrder: number;
  imageUrl?: string;
  tags: string[];
  seasonalItem: boolean;
  validFrom?: string; // ISO date string
  validTo?: string; // ISO date string
  isAvailableToday: boolean;
  maxBookingsPerDay?: number;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemSummaryResponseDto {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryDisplay: string;
  duration: number;
  durationDisplay: string;
  price: number;
  priceDisplay: string;
  isPackage: boolean;
  availableOnline: boolean;
  isAvailableToday: boolean;
  displayOrder: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface MenuItemListResponseDto {
  menuItems: MenuItemSummaryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter DTOs
export interface GetMenuItemsFilterDto {
  category?: string;
  isActive?: boolean;
  isPackage?: boolean;
  availableOnline?: boolean;
  seasonalItem?: boolean;
  advanceBookingRequired?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
  availableForDate?: string; // ISO date string
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Category DTOs
export interface MenuCategoryResponseDto {
  category: string;
  categoryDisplay: string;
  description: string;
  itemCount: number;
  isPackageCategory: boolean;
  requiresAdvanceBooking: boolean;
}

export interface MenuCategoriesResponseDto {
  categories: MenuCategoryResponseDto[];
  totalCategories: number;
}

// Analytics DTOs
export interface MenuAnalyticsResponseDto {
  totalActiveItems: number;
  packageItems: number;
  individualServices: number;
  seasonalItems: number;
  onlineAvailableItems: number;
  categoryBreakdown: Array<{
    category: string;
    categoryDisplay: string;
    count: number;
    averagePrice: number;
  }>;
  durationDistribution: Array<{
    durationRange: string;
    count: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Booking DTOs
export interface MenuItemAvailabilityRequestDto {
  date: string; // ISO date string
  includeAdvanceBooking?: boolean;
}

export interface MenuItemAvailabilityResponseDto {
  date: string;
  availableItems: MenuItemSummaryResponseDto[];
  advanceBookingItems: MenuItemSummaryResponseDto[];
  unavailableItems: Array<{
    item: MenuItemSummaryResponseDto;
    reason: string;
  }>;
}

// Display and Organization DTOs
export interface MenuDisplayRequestDto {
  category?: string;
  includeInactive?: boolean;
  groupByCategory?: boolean;
}

export interface MenuDisplayResponseDto {
  menuSections: Array<{
    category: string;
    categoryDisplay: string;
    description: string;
    items: MenuItemSummaryResponseDto[];
  }>;
  featuredItems: MenuItemSummaryResponseDto[];
  packageDeals: MenuItemSummaryResponseDto[];
  seasonalOffers: MenuItemSummaryResponseDto[];
} 