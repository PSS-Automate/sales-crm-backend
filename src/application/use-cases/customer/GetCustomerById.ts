import { UseCase } from '@shared/base-classes/UseCase';
import { Customer } from '../../../domain/entities/Customer';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { CustomerResponseDto } from '../../dtos/CustomerDto';
import { NotFoundError } from '@shared/errors/DomainError';

export interface GetCustomerByIdRequest {
  id: string;
}

export class GetCustomerById extends UseCase<GetCustomerByIdRequest, CustomerResponseDto> {
  constructor(private customerRepository: ICustomerRepository) {
    super();
  }

  public async execute(request: GetCustomerByIdRequest): Promise<CustomerResponseDto> {
    // Get customer from repository
    const customer = await this.customerRepository.findById(request.id);

    if (!customer) {
      throw new NotFoundError('Customer', request.id);
    }

    // Map to response DTO
    return this.mapToResponseDto(customer);
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