import { UseCase } from '@shared/base-classes/UseCase';
import { Customer } from '../../../domain/entities/Customer';
import { Email, Phone, LoyaltyPoints } from '../../../domain/value-objects';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { CreateCustomerDto, CustomerResponseDto } from '../../dtos/CustomerDto';
import { ConflictError } from '@shared/errors/DomainError';

export class CreateCustomer extends UseCase<CreateCustomerDto, CustomerResponseDto> {
  constructor(private customerRepository: ICustomerRepository) {
    super();
  }

  public async execute(request: CreateCustomerDto): Promise<CustomerResponseDto> {
    // Create value objects (this validates them)
    const email = Email.create(request.email);
    const phone = Phone.create(request.phone);

    // Check for duplicates
    await this.checkForDuplicates(email, phone);

    // Create customer entity
    const customer = Customer.create({
      name: request.name,
      email,
      phone,
      whatsappId: request.whatsappId,
      avatar: request.avatar,
      loyaltyPoints: LoyaltyPoints.zero(),
      totalVisits: 0,
      preferences: request.preferences,
      isActive: true
    });

    // Persist to repository
    const savedCustomer = await this.customerRepository.create(customer);

    // Return DTO
    return this.mapToResponseDto(savedCustomer);
  }

  private async checkForDuplicates(email: Email, phone: Phone): Promise<void> {
    const [existingByEmail, existingByPhone] = await Promise.all([
      this.customerRepository.findByEmail(email),
      this.customerRepository.findByPhone(phone)
    ]);

    if (existingByEmail) {
      throw new ConflictError('Customer with this email already exists');
    }

    if (existingByPhone) {
      throw new ConflictError('Customer with this phone number already exists');
    }
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