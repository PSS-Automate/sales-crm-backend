import { UseCase } from '@shared/base-classes/UseCase';
import { Customer } from '../../../domain/entities/Customer';
import { ICustomerRepository, CustomerSearchOptions } from '../../../domain/repositories/ICustomerRepository';
import { CustomerSearchDto, CustomerListResponseDto, CustomerResponseDto } from '../../dtos/CustomerDto';

export class GetCustomers extends UseCase<CustomerSearchDto, CustomerListResponseDto> {
  constructor(private customerRepository: ICustomerRepository) {
    super();
  }

  public async execute(request: CustomerSearchDto): Promise<CustomerListResponseDto> {
    // Map DTO to repository search options
    const searchOptions: CustomerSearchOptions = {
      page: request.page || 1,
      limit: Math.min(request.limit || 10, 100), // Cap at 100 per page
      search: request.search,
      email: request.email,
      phone: request.phone,
      whatsappId: request.whatsappId,
      isActive: request.isActive,
      loyaltyTier: request.loyaltyTier,
      minLoyaltyPoints: request.minLoyaltyPoints,
      maxLoyaltyPoints: request.maxLoyaltyPoints,
      lastVisitAfter: request.lastVisitAfter ? new Date(request.lastVisitAfter) : undefined,
      lastVisitBefore: request.lastVisitBefore ? new Date(request.lastVisitBefore) : undefined,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    };

    // Get customers from repository
    const result = await this.customerRepository.search(searchOptions);

    // Map to response DTOs
    const customers = result.items.map(customer => this.mapToResponseDto(customer));

    return {
      customers,
      pagination: result.pagination
    };
  }

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    const json = customer.toJSON();
    
    return {
      id: json.id,
      name: json.name,
      email: json.email,
      phone: json.phone,
      whatsappId: json.whatsappId,
      avatar: json.avatar,
      loyaltyPoints: json.loyaltyPoints,
      loyaltyTier: json.loyaltyTier,
      discountPercentage: json.discountPercentage,
      totalVisits: json.totalVisits,
      lastVisit: json.lastVisit,
      preferences: json.preferences,
      metadata: json.metadata,
      isActive: json.isActive,
      isVip: json.isVip,
      daysSinceLastVisit: json.daysSinceLastVisit,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };
  }
} 