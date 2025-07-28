import { MenuItem } from '../../../domain/entities/MenuItem';
import { IMenuItemRepository, FindMenuItemOptions } from '../../../domain/repositories/IMenuItemRepository';
import { MenuCategory } from '../../../domain/value-objects/MenuCategory';
import { ServiceDuration } from '../../../domain/value-objects/ServiceDuration';
import { NotFoundError, ConflictError } from '../../../shared/errors/DomainError';
import { FindAllOptions, PaginatedResult } from '../../../shared/interfaces/IRepository';

// Temporary in-memory implementation until database tables are created
export class MenuItemRepository implements IMenuItemRepository {
  private menuItems: Map<string, MenuItem> = new Map();

  constructor() {}

  async save(menuItem: MenuItem): Promise<MenuItem> {
    // Check for duplicate name
    for (const existingMenuItem of this.menuItems.values()) {
      if (existingMenuItem.id !== menuItem.id && 
          existingMenuItem.name.toLowerCase() === menuItem.name.toLowerCase()) {
        throw new ConflictError('Menu item with this name already exists');
      }
    }

    this.menuItems.set(menuItem.id, menuItem);
    return menuItem;
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.menuItems.get(id) || null;
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    const {
      page = 1,
      limit = 10,
      search,
      orderBy = 'displayOrder',
      orderDirection = 'asc'
    } = options;

    let menuItemList = Array.from(this.menuItems.values());

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      menuItemList = menuItemList.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    menuItemList.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (orderBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price.value;
          bValue = b.price.value;
          break;
        case 'displayOrder':
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
      }
      
      if (orderDirection === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const total = menuItemList.length;
    const offset = (page - 1) * limit;
    const paginatedItems = menuItemList.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async create(menuItem: MenuItem): Promise<MenuItem> {
    return this.save(menuItem);
  }

  async update(id: string, partialMenuItem: Partial<MenuItem>): Promise<MenuItem> {
    const existingMenuItem = await this.findById(id);
    if (!existingMenuItem) {
      throw new NotFoundError('Menu item not found', 'id');
    }

    // For now, just return the existing menu item
    // In a real implementation, you'd update the fields
    return existingMenuItem;
  }

  async delete(id: string): Promise<void> {
    const menuItem = await this.findById(id);
    if (!menuItem) {
      throw new NotFoundError('Menu item not found', 'id');
    }

    this.menuItems.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.menuItems.has(id);
  }

  // Entity-specific search methods
  async findByName(name: string): Promise<MenuItem | null> {
    for (const menuItem of this.menuItems.values()) {
      if (menuItem.name.toLowerCase() === name.toLowerCase()) {
        return menuItem;
      }
    }
    return null;
  }

  async findByCategory(category: MenuCategory, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ category }, options);
  }

  async findByDisplayOrder(order: number): Promise<MenuItem | null> {
    for (const menuItem of this.menuItems.values()) {
      if (menuItem.displayOrder === order) {
        return menuItem;
      }
    }
    return null;
  }

  // Business query methods
  async findActiveMenuItems(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ isActive: true }, options);
  }

  async findAvailableOnline(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ availableOnline: true }, options);
  }

  async findPackageItems(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ isPackage: true }, options);
  }

  async findIndividualServices(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ isPackage: false }, options);
  }

  async findSeasonalItems(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ seasonalItem: true }, options);
  }

  async findByDurationRange(minMinutes: number, maxMinutes: number, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ minDuration: minMinutes, maxDuration: maxMinutes }, options);
  }

  async findByPriceRange(minPrice: number, maxPrice: number, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ minPrice, maxPrice }, options);
  }

  async findByTags(tags: string[], options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ tags }, options);
  }

  async findAdvanceBookingItems(options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findByFilters({ advanceBookingRequired: true }, options);
  }

  // Availability and scheduling methods
  async findAvailableItemsForDate(date: Date, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    const menuItemList = Array.from(this.menuItems.values()).filter(item => {
      if (!item.isActive) return false;
      if (item.seasonalItem) {
        if (item.validFrom && date < item.validFrom) return false;
        if (item.validTo && date > item.validTo) return false;
      }
      return true;
    });

    // Apply pagination and sorting logic
    const total = menuItemList.length;
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    const paginatedItems = menuItemList.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findItemsNeedingAdvanceBooking(daysAhead: number = 7): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => 
      item.advanceBookingRequired && 
      (item.advanceBookingDays || 0) <= daysAhead
    );
  }

  // Menu organization methods
  async findByDisplayOrderRange(startOrder: number, endOrder: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => 
      item.displayOrder >= startOrder && item.displayOrder <= endOrder
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getNextDisplayOrder(category?: MenuCategory): Promise<number> {
    let maxOrder = 0;
    for (const menuItem of this.menuItems.values()) {
      if (!category || menuItem.category.value === category.value) {
        maxOrder = Math.max(maxOrder, menuItem.displayOrder);
      }
    }
    return maxOrder + 1;
  }

  async reorderMenuItems(menuItemOrders: Array<{ id: string; displayOrder: number }>): Promise<void> {
    for (const orderUpdate of menuItemOrders) {
      const menuItem = this.menuItems.get(orderUpdate.id);
      if (menuItem) {
        // In a real implementation, you'd update the display order
        // For now, this is a placeholder
      }
    }
  }

  // Advanced filtering
  async findByFilters(filters: FindMenuItemOptions, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    const {
      page = 1,
      limit = 10,
      search,
      orderBy = 'displayOrder',
      orderDirection = 'asc'
    } = options;

    let menuItemList = Array.from(this.menuItems.values());

    // Apply filters
    if (filters.category) {
      menuItemList = menuItemList.filter(item => 
        item.category.value === filters.category!.value
      );
    }

    if (filters.isActive !== undefined) {
      menuItemList = menuItemList.filter(item => item.isActive === filters.isActive);
    }

    if (filters.isPackage !== undefined) {
      menuItemList = menuItemList.filter(item => item.isPackage === filters.isPackage);
    }

    if (filters.availableOnline !== undefined) {
      menuItemList = menuItemList.filter(item => item.availableOnline === filters.availableOnline);
    }

    if (filters.seasonalItem !== undefined) {
      menuItemList = menuItemList.filter(item => item.seasonalItem === filters.seasonalItem);
    }

    if (filters.advanceBookingRequired !== undefined) {
      menuItemList = menuItemList.filter(item => item.advanceBookingRequired === filters.advanceBookingRequired);
    }

    if (filters.minPrice !== undefined) {
      menuItemList = menuItemList.filter(item => item.price.value >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      menuItemList = menuItemList.filter(item => item.price.value <= filters.maxPrice!);
    }

          if (filters.minDuration !== undefined) {
        menuItemList = menuItemList.filter(item => item.duration.value >= filters.minDuration!);
      }

      if (filters.maxDuration !== undefined) {
        menuItemList = menuItemList.filter(item => item.duration.value <= filters.maxDuration!);
      }

    if (filters.tags && filters.tags.length > 0) {
      menuItemList = menuItemList.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      menuItemList = menuItemList.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    menuItemList.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (orderBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price.value;
          bValue = b.price.value;
          break;
        case 'displayOrder':
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
      }
      
      if (orderDirection === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    const total = menuItemList.length;
    const offset = (page - 1) * limit;
    const paginatedItems = menuItemList.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async searchMenuItems(searchTerm: string, options: FindAllOptions = {}): Promise<PaginatedResult<MenuItem>> {
    return this.findAll({ ...options, search: searchTerm });
  }

  // Analytics and reporting methods
  async getTotalActiveMenuItems(): Promise<number> {
    return Array.from(this.menuItems.values()).filter(item => item.isActive).length;
  }

  async getMenuItemCountByCategory(): Promise<Array<{ category: string; count: number }>> {
    const categoryCounts = new Map<string, number>();
    
    for (const menuItem of this.menuItems.values()) {
      if (menuItem.isActive) {
        const count = categoryCounts.get(menuItem.category.value) || 0;
        categoryCounts.set(menuItem.category.value, count + 1);
      }
    }

    return Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count
    }));
  }

  async getAveragePriceByCategory(): Promise<Array<{ category: string; averagePrice: number }>> {
    const categoryData = new Map<string, { total: number; count: number }>();
    
    for (const menuItem of this.menuItems.values()) {
      if (menuItem.isActive) {
        const existing = categoryData.get(menuItem.category.value) || { total: 0, count: 0 };
        existing.total += menuItem.price.value;
        existing.count += 1;
        categoryData.set(menuItem.category.value, existing);
      }
    }

    return Array.from(categoryData.entries()).map(([category, data]) => ({
      category,
      averagePrice: data.total / data.count
    }));
  }

  async getPopularTags(): Promise<Array<{ tag: string; count: number }>> {
    const tagCounts = new Map<string, number>();
    
    for (const menuItem of this.menuItems.values()) {
      if (menuItem.isActive) {
        for (const tag of menuItem.tags) {
          const count = tagCounts.get(tag) || 0;
          tagCounts.set(tag, count + 1);
        }
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getDurationDistribution(): Promise<Array<{ durationRange: string; count: number }>> {
    const durationRanges = [
      { range: '0-30 min', min: 0, max: 30 },
      { range: '31-60 min', min: 31, max: 60 },
      { range: '61-120 min', min: 61, max: 120 },
      { range: '121+ min', min: 121, max: Infinity }
    ];

    return durationRanges.map(({ range, min, max }) => {
             const count = Array.from(this.menuItems.values()).filter(item => {
         const duration = item.duration.value;
         return item.isActive && duration >= min && duration <= max;
       }).length;

      return { durationRange: range, count };
    });
  }
} 