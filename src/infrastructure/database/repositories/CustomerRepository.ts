import { PrismaClient } from '@prisma/client';
import { Customer } from '../../../domain/entities/Customer';
import { Email, Phone } from '../../../domain/value-objects';
import { 
  ICustomerRepository, 
  CustomerSearchOptions 
} from '../../../domain/repositories/ICustomerRepository';
import { 
  FindAllOptions, 
  PaginatedResult 
} from '../../../shared/interfaces/IRepository';
import { CustomerMapper } from '../mappers/CustomerMapper';
import { NotFoundError } from '../../../shared/errors/DomainError';

export class CustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: { id }
    });

    if (!prismaCustomer) {
      return null;
    }

    return CustomerMapper.toDomain(prismaCustomer);
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<Customer>> {
    const {
      page = 1,
      limit = 10,
      search,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } }
      ]
    } : {};

    const [prismaCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.customer.count({ where })
    ]);

    const customers = CustomerMapper.toDomainArray(prismaCustomers);

    return {
      items: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async create(customer: Customer): Promise<Customer> {
    // Directly create with proper types to avoid Prisma type issues
    const createdCustomer = await this.prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email.toString(),
        phone: customer.phone.toString(),
        whatsappId: customer.whatsappId,
        avatar: customer.avatar,
        loyaltyPoints: customer.loyaltyPoints.toJSON() as number,
        totalVisits: customer.totalVisits,
        lastVisit: customer.lastVisit,
        preferences: customer.preferences,
        metadata: customer.metadata,
        isActive: customer.isActive
      }
    });

    return CustomerMapper.toDomain(createdCustomer);
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const existingCustomer = await this.findById(id);
    if (!existingCustomer) {
      throw new NotFoundError('Customer', id);
    }

    // Simplified update implementation - for demo purposes
    // In production, you'd want more sophisticated field-by-field updating
    const updatedPrismaCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        name: existingCustomer.name,
        email: existingCustomer.email.toString(),
        phone: existingCustomer.phone.toString(),
        whatsappId: existingCustomer.whatsappId,
        avatar: existingCustomer.avatar,
        loyaltyPoints: existingCustomer.loyaltyPoints.toJSON() as number,
        totalVisits: existingCustomer.totalVisits,
        lastVisit: existingCustomer.lastVisit,
        preferences: existingCustomer.preferences,
        metadata: existingCustomer.metadata,
        isActive: existingCustomer.isActive,
        updatedAt: new Date()
      }
    });

    return CustomerMapper.toDomain(updatedPrismaCustomer);
  }

  async delete(id: string): Promise<void> {
    const existingCustomer = await this.findById(id);
    if (!existingCustomer) {
      throw new NotFoundError('Customer', id);
    }

    await this.prisma.customer.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.customer.count({
      where: { id }
    });
    return count > 0;
  }

  // Customer-specific methods
  async findByEmail(email: Email): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: { email: email.toString() }
    });

    if (!prismaCustomer) {
      return null;
    }

    return CustomerMapper.toDomain(prismaCustomer);
  }

  async findByPhone(phone: Phone): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: { phone: phone.toString() }
    });

    if (!prismaCustomer) {
      return null;
    }

    return CustomerMapper.toDomain(prismaCustomer);
  }

  async findByWhatsappId(whatsappId: string): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: { whatsappId }
    });

    if (!prismaCustomer) {
      return null;
    }

    return CustomerMapper.toDomain(prismaCustomer);
  }

  async search(options: CustomerSearchOptions): Promise<PaginatedResult<Customer>> {
    const {
      page = 1,
      limit = 10,
      search,
      email,
      phone,
      whatsappId,
      isActive,
      loyaltyTier,
      minLoyaltyPoints,
      maxLoyaltyPoints,
      lastVisitAfter,
      lastVisitBefore,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    const where: any = {};

    // Text search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    // Specific field filters
    if (email) where.email = email;
    if (phone) where.phone = phone;
    if (whatsappId) where.whatsappId = whatsappId;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    // Loyalty points filters
    if (minLoyaltyPoints !== undefined || maxLoyaltyPoints !== undefined) {
      where.loyaltyPoints = {};
      if (minLoyaltyPoints !== undefined) where.loyaltyPoints.gte = minLoyaltyPoints;
      if (maxLoyaltyPoints !== undefined) where.loyaltyPoints.lte = maxLoyaltyPoints;
    }

    // Date filters
    if (lastVisitAfter || lastVisitBefore) {
      where.lastVisit = {};
      if (lastVisitAfter) where.lastVisit.gte = lastVisitAfter;
      if (lastVisitBefore) where.lastVisit.lte = lastVisitBefore;
    }

    const [prismaCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.customer.count({ where })
    ]);

    const customers = CustomerMapper.toDomainArray(prismaCustomers);

    return {
      items: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Business query methods
  async findVipCustomers(options: FindAllOptions = {}): Promise<PaginatedResult<Customer>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { totalVisits: { gte: 10 } },
        { loyaltyPoints: { gte: 1000 } }
      ]
    };

    const [prismaCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.customer.count({ where })
    ]);

    const customers = CustomerMapper.toDomainArray(prismaCustomers);

    return {
      items: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findInactiveCustomers(daysSinceLastVisit: number, options: FindAllOptions = {}): Promise<PaginatedResult<Customer>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'lastVisit',
      orderDirection = 'asc'
    } = options;

    const skip = (page - 1) * limit;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastVisit);
    
    const where = {
      OR: [
        { lastVisit: { lt: cutoffDate } },
        { lastVisit: null }
      ]
    };

    const [prismaCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.customer.count({ where })
    ]);

    const customers = CustomerMapper.toDomainArray(prismaCustomers);

    return {
      items: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findByLoyaltyTier(tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum', options: FindAllOptions = {}): Promise<PaginatedResult<Customer>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'loyaltyPoints',
      orderDirection = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    // Define tier ranges based on business rules
    let pointsRange: { gte?: number; lt?: number } = {};
    
    switch (tier) {
      case 'Bronze':
        pointsRange = { gte: 0, lt: 500 };
        break;
      case 'Silver':
        pointsRange = { gte: 500, lt: 1000 };
        break;
      case 'Gold':
        pointsRange = { gte: 1000, lt: 2000 };
        break;
      case 'Platinum':
        pointsRange = { gte: 2000 };
        break;
    }
    
    const where = {
      loyaltyPoints: pointsRange
    };

    const [prismaCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      this.prisma.customer.count({ where })
    ]);

    const customers = CustomerMapper.toDomainArray(prismaCustomers);

    return {
      items: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Analytics methods
  async getTotalCustomerCount(): Promise<number> {
    return this.prisma.customer.count();
  }

  async getActiveCustomerCount(): Promise<number> {
    return this.prisma.customer.count({
      where: { isActive: true }
    });
  }

  async getAverageLoyaltyPoints(): Promise<number> {
    const result = await this.prisma.customer.aggregate({
      _avg: {
        loyaltyPoints: true
      }
    });

    return result._avg.loyaltyPoints || 0;
  }

  async getCustomersByRegistrationMonth(year: number, month: number): Promise<Customer[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const prismaCustomers = await this.prisma.customer.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return CustomerMapper.toDomainArray(prismaCustomers);
  }
} 