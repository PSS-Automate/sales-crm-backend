import { UseCase } from '@shared/base-classes/UseCase';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { BusinessType } from '../../../domain/value-objects/BusinessType';
import { GetClientsFilterDto, ClientListResponseDto, ClientSummaryResponseDto } from '../../dtos/ClientDto';

export class GetClients extends UseCase<GetClientsFilterDto, ClientListResponseDto> {
  constructor(private clientRepository: IClientRepository) {
    super();
  }

  public async execute(request: GetClientsFilterDto): Promise<ClientListResponseDto> {
    // Set default pagination
    const page = request.page || 1;
    const limit = Math.min(request.limit || 20, 100); // Max 100 items per page

    // Build find options
    const findOptions = {
      page,
      limit,
      search: request.search?.trim(),
      sortBy: request.sortBy || 'companyName',
      sortOrder: request.sortOrder || 'asc' as const
    };

    // Build filters
    const filters = {
      businessType: request.businessType ? BusinessType.create(request.businessType as any) : undefined,
      isActive: request.isActive,
      hasActiveContract: request.hasActiveContract,
      creditOverLimit: request.creditOverLimit,
      contractExpiring: request.contractExpiring,
      expiringDays: request.expiringDays || 30
    };

    // Execute search based on filters
    const result = await this.clientRepository.findByFilters(filters, findOptions);

    // Map to response DTOs
    const clients = result.data.map(client => this.mapToSummaryDto(client));

    return {
      clients,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  }

  private mapToSummaryDto(client: any): ClientSummaryResponseDto {
    const json = client.toJSON();
    
    return {
      id: json.id,
      companyName: json.companyName,
      businessType: json.businessType,
      businessTypeDisplay: client.businessType.getDisplayName(),
      primaryContactName: json.primaryContact.name,
      primaryContactEmail: json.primaryContact.email,
      currentBalance: json.currentBalance,
      availableCredit: json.availableCredit,
      hasActiveContract: json.hasActiveContract,
      isActive: json.isActive
    };
  }
} 