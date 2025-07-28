import { Client } from '../../../domain/entities/Client';
import { IClientRepository, FindClientOptions, PaginatedResult, FindAllOptions } from '../../../domain/repositories/IClientRepository';
import { BusinessType } from '../../../domain/value-objects/BusinessType';
import { NotFoundError, ConflictError } from '../../../shared/errors/DomainError';
import { PaginatedResult as BasePaginatedResult } from '../../../shared/interfaces/IRepository';

// Temporary in-memory implementation until database tables are created
export class ClientRepository implements IClientRepository {
  private clients: Map<string, Client> = new Map();

  constructor() {}

  async save(client: Client): Promise<Client> {
    // Check for duplicate company name
    for (const existingClient of this.clients.values()) {
      if (existingClient.id !== client.id && 
          existingClient.companyName.toLowerCase() === client.companyName.toLowerCase()) {
        throw new ConflictError('Client with this company name already exists');
      }
    }

    this.clients.set(client.id, client);
    return client;
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findAll(options: FindAllOptions = {}): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'companyName',
      sortOrder = 'asc'
    } = options;

    let clientList = Array.from(this.clients.values());

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      clientList = clientList.filter(client => 
        client.companyName.toLowerCase().includes(searchLower) ||
        client.registrationNumber?.toLowerCase().includes(searchLower) ||
        client.taxId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    clientList.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'companyName':
          aValue = a.companyName;
          bValue = b.companyName;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.companyName;
          bValue = b.companyName;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const total = clientList.length;
    const offset = (page - 1) * limit;
    const paginatedClients = clientList.slice(offset, offset + limit);

    return {
      data: paginatedClients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(client: Client): Promise<Client> {
    return this.save(client);
  }

  async update(id: string, partialClient: Partial<Client>): Promise<Client> {
    const existingClient = await this.findById(id);
    if (!existingClient) {
      throw new NotFoundError('Client not found', 'id');
    }

    // For now, just return the existing client
    // In a real implementation, you'd update the fields
    return existingClient;
  }

  async delete(id: string): Promise<void> {
    const client = await this.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found', 'id');
    }

    this.clients.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.clients.has(id);
  }

  // Entity-specific search methods
  async findByCompanyName(companyName: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.companyName.toLowerCase() === companyName.toLowerCase()) {
        return client;
      }
    }
    return null;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.registrationNumber === registrationNumber) {
        return client;
      }
    }
    return null;
  }

  async findByTaxId(taxId: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.taxId === taxId) {
        return client;
      }
    }
    return null;
  }

  async findByContactEmail(email: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.primaryContact.email.value === email) {
        return client;
      }
      // Check secondary contacts too
      for (const contact of client.secondaryContacts) {
        if (contact.email.value === email) {
          return client;
        }
      }
    }
    return null;
  }

  // Business query methods
  async findActiveClients(options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    return this.findByFilters({ isActive: true }, options);
  }

  async findByBusinessType(businessType: BusinessType, options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    return this.findByFilters({ businessType }, options);
  }

  async findClientsWithActiveContracts(options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    return this.findByFilters({ hasActiveContract: true }, options);
  }

  async findExpiringContracts(daysAhead: number = 30, options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    return this.findByFilters({ contractExpiring: true, expiringDays: daysAhead }, options);
  }

  async findClientsOverCreditLimit(options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    return this.findByFilters({ creditOverLimit: true }, options);
  }

  async findClientsNearCreditLimit(threshold: number = 0.9, options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    // Implementation would depend on how credit utilization is calculated
    return {
      data: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: 0
    };
  }

  // Advanced filtering
  async findByFilters(filters: FindClientOptions, options: FindAllOptions = {}): Promise<PaginatedResult<Client>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'companyName',
      sortOrder = 'asc'
    } = options;

    let clientList = Array.from(this.clients.values());

    // Apply filters
    if (filters.businessType) {
      clientList = clientList.filter(client => 
        client.businessType.value === filters.businessType!.value
      );
    }

    if (filters.isActive !== undefined) {
      clientList = clientList.filter(client => client.isActive === filters.isActive);
    }

    if (filters.hasActiveContract) {
      const now = new Date();
      clientList = clientList.filter(client => 
        client.contractStartDate && 
        client.contractStartDate <= now && 
        (!client.contractEndDate || client.contractEndDate >= now)
      );
    }

    if (filters.contractExpiring && filters.expiringDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.expiringDays);
      const now = new Date();
      
      clientList = clientList.filter(client => 
        client.contractEndDate && 
        client.contractEndDate >= now && 
        client.contractEndDate <= futureDate
      );
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      clientList = clientList.filter(client => 
        client.companyName.toLowerCase().includes(searchLower) ||
        client.registrationNumber?.toLowerCase().includes(searchLower) ||
        client.taxId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting and pagination (same logic as findAll)
    clientList.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'companyName':
          aValue = a.companyName;
          bValue = b.companyName;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.companyName;
          bValue = b.companyName;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    const total = clientList.length;
    const offset = (page - 1) * limit;
    const paginatedClients = clientList.slice(offset, offset + limit);

    return {
      data: paginatedClients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Business intelligence methods
  async getTotalActiveClients(): Promise<number> {
    return Array.from(this.clients.values()).filter(client => client.isActive).length;
  }

  async getTotalCreditOutstanding(): Promise<number> {
    // This would require a separate transactions/charges table
    return 0;
  }

  async getClientsWithBalanceByBusinessType(): Promise<Array<{ businessType: string; count: number; totalBalance: number }>> {
    const businessTypeCounts = new Map<string, number>();
    
    for (const client of this.clients.values()) {
      if (client.isActive) {
        const count = businessTypeCounts.get(client.businessType.value) || 0;
        businessTypeCounts.set(client.businessType.value, count + 1);
      }
    }

    return Array.from(businessTypeCounts.entries()).map(([businessType, count]) => ({
      businessType,
      count,
      totalBalance: 0 // Would need financial data
    }));
  }

  async getContractExpiryReport(daysAhead: number = 30): Promise<Array<{ client: Client; daysUntilExpiry: number }>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const now = new Date();

    const expiringClients: Array<{ client: Client; daysUntilExpiry: number }> = [];

    for (const client of this.clients.values()) {
      if (client.isActive && 
          client.contractEndDate && 
          client.contractEndDate >= now && 
          client.contractEndDate <= futureDate) {
        
        const daysUntilExpiry = Math.ceil(
          (client.contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        expiringClients.push({ client, daysUntilExpiry });
      }
    }

    return expiringClients.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }
} 