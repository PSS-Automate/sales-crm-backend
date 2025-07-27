import { UseCase } from '@shared/base-classes/UseCase';
import { NotFoundError } from '@shared/errors/DomainError';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ClientResponseDto } from '../../dtos/ClientDto';

export interface GetClientByIdRequest {
  id: string;
}

export class GetClientById extends UseCase<GetClientByIdRequest, ClientResponseDto> {
  constructor(private clientRepository: IClientRepository) {
    super();
  }

  public async execute(request: GetClientByIdRequest): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(request.id);

    if (!client) {
      throw new NotFoundError('Client', request.id);
    }

    return this.mapToResponseDto(client);
  }

  private mapToResponseDto(client: Client): ClientResponseDto {
    const json = client.toJSON();
    
    return {
      id: json.id,
      companyName: json.companyName,
      businessType: json.businessType,
      businessTypeDisplay: client.businessType.getDisplayName(),
      registrationNumber: json.registrationNumber,
      taxId: json.taxId,
      website: json.website,
      primaryContact: {
        name: json.primaryContact.name,
        position: json.primaryContact.position,
        email: json.primaryContact.email,
        phone: json.primaryContact.phone,
        isPrimary: json.primaryContact.isPrimary
      },
      secondaryContacts: json.secondaryContacts.map((contact: any) => ({
        name: contact.name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone,
        isPrimary: contact.isPrimary
      })),
      billingAddress: json.billingAddress,
      shippingAddress: json.shippingAddress,
      creditTerms: {
        paymentTerms: json.creditTerms.paymentTerms,
        creditLimit: json.creditTerms.creditLimit,
        currentBalance: json.creditTerms.currentBalance,
        availableCredit: json.creditTerms.availableCredit,
        discountPercent: json.creditTerms.discountPercent,
        customTermsDays: json.creditTerms.customTermsDays,
        isActive: json.creditTerms.isActive,
        termsDescription: json.creditTerms.termsDescription,
        paymentDueDays: json.creditTerms.paymentDueDays
      },
      contractStartDate: json.contractStartDate,
      contractEndDate: json.contractEndDate,
      hasActiveContract: json.hasActiveContract,
      isContractExpiring: client.isContractExpiring(),
      notes: json.notes,
      metadata: json.metadata,
      isActive: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };
  }
} 