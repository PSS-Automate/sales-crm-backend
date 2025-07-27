import { IRepository, FindAllOptions, PaginatedResult } from '@shared/interfaces/IRepository';
import { MenuItem } from '../entities/MenuItem';
import { MenuCategory } from '../value-objects/MenuCategory';
import { ServiceDuration } from '../value-objects/ServiceDuration';

export interface FindMenuItemOptions {
  category?: MenuCategory;
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
}



export interface IMenuItemRepository extends IRepository<MenuItem, string> {
  // Entity-specific search methods
  findByName(name: string): Promise<MenuItem | null>;
  findByCategory(category: MenuCategory, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findByDisplayOrder(order: number): Promise<MenuItem | null>;
  
  // Business query methods
  findActiveMenuItems(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findAvailableOnline(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findPackageItems(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findIndividualServices(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findSeasonalItems(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findByDurationRange(minMinutes: number, maxMinutes: number, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findByPriceRange(minPrice: number, maxPrice: number, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findByTags(tags: string[], options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findAdvanceBookingItems(options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  
  // Availability and scheduling methods
  findAvailableItemsForDate(date: Date, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  findItemsNeedingAdvanceBooking(daysAhead?: number): Promise<MenuItem[]>;
  
  // Menu organization methods
  findByDisplayOrderRange(startOrder: number, endOrder: number): Promise<MenuItem[]>;
  getNextDisplayOrder(category?: MenuCategory): Promise<number>;
  reorderMenuItems(menuItemOrders: Array<{ id: string; displayOrder: number }>): Promise<void>;
  
  // Advanced filtering
  findByFilters(filters: FindMenuItemOptions, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  searchMenuItems(searchTerm: string, options?: FindAllOptions): Promise<PaginatedResult<MenuItem>>;
  
  // Analytics and reporting methods
  getTotalActiveMenuItems(): Promise<number>;
  getMenuItemCountByCategory(): Promise<Array<{ category: string; count: number }>>;
  getAveragePriceByCategory(): Promise<Array<{ category: string; averagePrice: number }>>;
  getPopularTags(): Promise<Array<{ tag: string; count: number }>>;
  getDurationDistribution(): Promise<Array<{ durationRange: string; count: number }>>;
} 