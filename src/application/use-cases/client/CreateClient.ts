import { UseCase } from '@shared/base-classes/UseCase';
import { ValidationError, ConflictError } from '@shared/errors/DomainError';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { Email, Phone, BusinessType, ContactPerson, CreditTerms } from '../../../domain/value-objects';
import { CreateClientRequestDto, ClientResponseDto } from '../../dtos/ClientDto';

export class CreateClient extends UseCase<CreateClientRequestDto, ClientResponseDto> {
  constructor(private clientRepository: IClientRepository) {
    super();
  }

  public async execute(request: CreateClientRequestDto): Promise<ClientResponseDto> {
    // 1. Validate input
    this.validateInput(request);

    // 2. Check for duplicates
    await this.checkForDuplicates(request);

    // 3. Create domain objects
    const businessType = BusinessType.create(request.businessType as any);
    const primaryContact = this.createContactPerson(request.primaryContact, true);
    const secondaryContacts = (request.secondaryContacts || []).map(contact => 
      this.createContactPerson(contact, false)
    );
    const creditTerms = this.createCreditTerms(request.creditTerms);

    // 4. Create client entity
    const client = Client.create({
      companyName: request.companyName.trim(),
      businessType,
      registrationNumber: request.registrationNumber?.trim(),
      taxId: request.taxId?.trim(),
      website: request.website?.trim(),
      primaryContact,
      secondaryContacts,
      billingAddress: request.billingAddress.trim(),
      shippingAddress: request.shippingAddress?.trim(),
      creditTerms,
      contractStartDate: request.contractStartDate ? new Date(request.contractStartDate) : undefined,
      contractEndDate: request.contractEndDate ? new Date(request.contractEndDate) : undefined,
      notes: request.notes?.trim(),
      metadata: request.metadata,
      isActive: true
    });

    // 5. Save client
    const savedClient = await this.clientRepository.create(client);

    // 6. Return response DTO
    return this.mapToResponseDto(savedClient);
  }

  private validateInput(request: CreateClientRequestDto): void {
    if (!request.companyName || request.companyName.trim().length === 0) {
      throw new ValidationError('Company name is required', 'companyName');
    }

    if (!request.businessType) {
      throw new ValidationError('Business type is required', 'businessType');
    }

    if (!request.primaryContact) {
      throw new ValidationError('Primary contact is required', 'primaryContact');
    }

    if (!request.billingAddress || request.billingAddress.trim().length === 0) {
      throw new ValidationError('Billing address is required', 'billingAddress');
    }

    if (!request.creditTerms) {
      throw new ValidationError('Credit terms are required', 'creditTerms');
    }

    // Validate contract dates
    if (request.contractStartDate && request.contractEndDate) {
      const startDate = new Date(request.contractStartDate);
      const endDate = new Date(request.contractEndDate);
      
      if (startDate >= endDate) {
        throw new ValidationError('Contract start date must be before end date', 'contractDates');
      }
    }

    // Validate secondary contacts limit
    if (request.secondaryContacts && request.secondaryContacts.length > 5) {
      throw new ValidationError('Cannot have more than 5 secondary contacts', 'secondaryContacts');
    }

    // Validate unique emails across contacts
    this.validateUniqueContactEmails(request);
  }

  private validateUniqueContactEmails(request: CreateClientRequestDto): void {
    const allEmails = [
      request.primaryContact.email,
      ...(request.secondaryContacts || []).map(c => c.email)
    ];

    const uniqueEmails = new Set(allEmails.map(email => email.toLowerCase()));
    
    if (uniqueEmails.size !== allEmails.length) {
      throw new ValidationError('Contact emails must be unique', 'contactEmails');
    }
  }

  private async checkForDuplicates(request: CreateClientRequestDto): Promise<void> {
    // Check company name
    const existingByName = await this.clientRepository.findByCompanyName(request.companyName.trim());
    if (existingByName) {
      throw new ConflictError('Client with this company name already exists');
    }

    // Check registration number
    if (request.registrationNumber) {
      const existingByRegNum = await this.clientRepository.findByRegistrationNumber(request.registrationNumber.trim());
      if (existingByRegNum) {
        throw new ConflictError('Client with this registration number already exists');
      }
    }

    // Check tax ID
    if (request.taxId) {
      const existingByTaxId = await this.clientRepository.findByTaxId(request.taxId.trim());
      if (existingByTaxId) {
        throw new ConflictError('Client with this tax ID already exists');
      }
    }

    // Check primary contact email
    const existingByEmail = await this.clientRepository.findByContactEmail(request.primaryContact.email);
    if (existingByEmail) {
      throw new ConflictError('Client with this primary contact email already exists');
    }
  }

  private createContactPerson(contactData: any, isPrimary: boolean): ContactPerson {
    const email = Email.create(contactData.email);
    const phone = Phone.create(contactData.phone);

    return ContactPerson.create({
      name: contactData.name.trim(),
      position: contactData.position.trim(),
      email,
      phone,
      isPrimary
    });
  }

  private createCreditTerms(creditData: any): CreditTerms {
    return CreditTerms.create({
      paymentTerms: creditData.paymentTerms as any,
      creditLimit: creditData.creditLimit,
      currentBalance: 0, // New clients start with zero balance
      discountPercent: creditData.discountPercent || 0,
      customTermsDays: creditData.customTermsDays,
      isActive: true
    });
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