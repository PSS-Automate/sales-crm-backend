import { Client, ClientProps } from '../../../domain/entities/Client';
import { BusinessType } from '../../../domain/value-objects/BusinessType';
import { ContactPerson } from '../../../domain/value-objects/ContactPerson';
import { CreditTerms } from '../../../domain/value-objects/CreditTerms';
import { Email } from '../../../domain/value-objects/Email';
import { Phone } from '../../../domain/value-objects/Phone';

export interface ClientPersistenceData {
  id: string;
  companyName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  primaryContact: any; // JSON
  secondaryContacts: any; // JSON array
  billingAddress: string;
  shippingAddress?: string;
  creditTerms: any; // JSON
  contractStartDate?: Date;
  contractEndDate?: Date;
  notes?: string;
  metadata?: any; // JSON
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ClientMapper {
  static toDomain(data: ClientPersistenceData): Client {
    const clientProps: ClientProps = {
      id: data.id,
      companyName: data.companyName,
      businessType: BusinessType.create(data.businessType as any),
      registrationNumber: data.registrationNumber,
      taxId: data.taxId,
      website: data.website,
      primaryContact: ContactPerson.create({
        name: data.primaryContact.name,
        position: data.primaryContact.position,
        email: Email.create(data.primaryContact.email),
        phone: Phone.create(data.primaryContact.phone),
        isPrimary: true
      }),
      secondaryContacts: (data.secondaryContacts || []).map((contact: any) => 
        ContactPerson.create({
          name: contact.name,
          position: contact.position,
          email: Email.create(contact.email),
          phone: Phone.create(contact.phone),
          isPrimary: false
        })
      ),
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      creditTerms: CreditTerms.create(data.creditTerms),
      contractStartDate: data.contractStartDate,
      contractEndDate: data.contractEndDate,
      notes: data.notes,
      metadata: data.metadata,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

    return new Client(clientProps);
  }

  static toPersistence(client: Client): Omit<ClientPersistenceData, 'id' | 'createdAt' | 'updatedAt'> {
    const json = client.toJSON();
    
    return {
      companyName: json.companyName,
      businessType: json.businessType,
      registrationNumber: json.registrationNumber,
      taxId: json.taxId,
      website: json.website,
      primaryContact: {
        name: json.primaryContact.name,
        position: json.primaryContact.position,
        email: json.primaryContact.email,
        phone: json.primaryContact.phone
      },
      secondaryContacts: json.secondaryContacts.map((contact: any) => ({
        name: contact.name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone
      })),
      billingAddress: json.billingAddress,
      shippingAddress: json.shippingAddress,
      creditTerms: json.creditTerms,
      contractStartDate: json.contractStartDate ? new Date(json.contractStartDate) : undefined,
      contractEndDate: json.contractEndDate ? new Date(json.contractEndDate) : undefined,
      notes: json.notes,
      metadata: json.metadata,
      isActive: json.isActive
    };
  }
} 