import { Customer as PrismaCustomer } from '@prisma/client';
import { Customer, CustomerProps } from '../../../domain/entities/Customer';
import { Email, Phone, LoyaltyPoints } from '../../../domain/value-objects';

export class CustomerMapper {
  /**
   * Converts Prisma model to Domain entity
   */
  public static toDomain(prismaCustomer: PrismaCustomer): Customer {
    const customerProps: CustomerProps = {
      id: prismaCustomer.id,
      name: prismaCustomer.name,
      email: Email.create(prismaCustomer.email),
      phone: Phone.create(prismaCustomer.phone),
      whatsappId: prismaCustomer.whatsappId || undefined,
      avatar: prismaCustomer.avatar || undefined,
      loyaltyPoints: LoyaltyPoints.create(prismaCustomer.loyaltyPoints),
      totalVisits: prismaCustomer.totalVisits,
      lastVisit: prismaCustomer.lastVisit || undefined,
      preferences: typeof prismaCustomer.preferences === 'string' ? prismaCustomer.preferences : undefined,
      metadata: prismaCustomer.metadata ? (prismaCustomer.metadata as Record<string, any>) : undefined,
      isActive: prismaCustomer.isActive,
      createdAt: prismaCustomer.createdAt,
      updatedAt: prismaCustomer.updatedAt
    };

    return new Customer(customerProps);
  }

  /**
   * Converts Domain entity to Prisma create input
   */
  public static toPrismaCreate(customer: Customer): Omit<PrismaCustomer, 'createdAt' | 'updatedAt'> {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email.toString(),
      phone: customer.phone.toString(),
      whatsappId: customer.whatsappId || null,
      avatar: customer.avatar || null,
      loyaltyPoints: customer.loyaltyPoints.toJSON() as number,
      totalVisits: customer.totalVisits,
      lastVisit: customer.lastVisit || null,
      preferences: customer.preferences || null,
      metadata: customer.metadata || null,
      isActive: customer.isActive
    };
  }

  /**
   * Converts Domain entity to Prisma update input
   */
  public static toPrismaUpdate(customer: Customer): Partial<Omit<PrismaCustomer, 'id' | 'createdAt'>> {
    return {
      name: customer.name,
      email: customer.email.toString(),
      phone: customer.phone.toString(),
      whatsappId: customer.whatsappId,
      avatar: customer.avatar,
      loyaltyPoints: customer.loyaltyPoints.toJSON() as number,
      totalVisits: customer.totalVisits,
      lastVisit: customer.lastVisit,
      preferences: customer.preferences,
      metadata: customer.metadata || null,
      isActive: customer.isActive,
      updatedAt: customer.updatedAt
    };
  }

  /**
   * Converts array of Prisma models to Domain entities
   */
  public static toDomainArray(prismaCustomers: PrismaCustomer[]): Customer[] {
    return prismaCustomers.map(prismaCustomer => this.toDomain(prismaCustomer));
  }
} 