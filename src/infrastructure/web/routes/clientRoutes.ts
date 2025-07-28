import { FastifyInstance } from 'fastify';
import { ClientController } from '../controllers/ClientController';

// Response schemas for Swagger documentation
const clientContactResponseSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    position: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    isPrimary: { type: 'boolean' }
  }
};

const clientCreditTermsResponseSchema = {
  type: 'object',
  properties: {
    paymentTerms: { type: 'string' },
    creditLimit: { type: 'number' },
    currentBalance: { type: 'number' },
    availableCredit: { type: 'number' },
    discountPercent: { type: 'number' },
    customTermsDays: { type: 'integer' },
    isActive: { type: 'boolean' },
    termsDescription: { type: 'string' },
    paymentDueDays: { type: 'integer' }
  }
};

const clientResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    companyName: { type: 'string' },
    businessType: { type: 'string' },
    businessTypeDisplay: { type: 'string' },
    registrationNumber: { type: 'string' },
    taxId: { type: 'string' },
    website: { type: 'string' },
    primaryContact: clientContactResponseSchema,
    secondaryContacts: {
      type: 'array',
      items: clientContactResponseSchema
    },
    billingAddress: { type: 'string' },
    shippingAddress: { type: 'string' },
    creditTerms: clientCreditTermsResponseSchema,
    contractStartDate: { type: 'string' },
    contractEndDate: { type: 'string' },
    hasActiveContract: { type: 'boolean' },
    isContractExpiring: { type: 'boolean' },
    notes: { type: 'string' },
    metadata: { type: 'object' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
};

const clientSummaryResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    companyName: { type: 'string' },
    businessType: { type: 'string' },
    businessTypeDisplay: { type: 'string' },
    primaryContactName: { type: 'string' },
    primaryContactEmail: { type: 'string' },
    currentBalance: { type: 'number' },
    availableCredit: { type: 'number' },
    hasActiveContract: { type: 'boolean' },
    isActive: { type: 'boolean' }
  }
};

const clientsListResponseSchema = {
  type: 'object',
  properties: {
    clients: {
      type: 'array',
      items: clientSummaryResponseSchema
    },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
};

export async function clientRoutes(
  fastify: FastifyInstance, 
  options: { clientController: ClientController }
) {
  const { clientController } = options;

  // Apply authentication to all client routes
  fastify.addHook('preHandler', (fastify as any).authenticate);

  // GET /api/clients
  fastify.get('/', {
    schema: {
      description: 'Get all clients with pagination and filtering',
      tags: ['clients'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string' },
          businessType: { 
            type: 'string',
            enum: [
              'CORPORATE', 'SALON_CHAIN', 'HOTEL_SPA', 'WEDDING_PLANNER',
              'EVENT_ORGANIZER', 'BEAUTY_SCHOOL', 'FRANCHISE', 'WHOLESALER', 'OTHER'
            ]
          },
          isActive: { type: 'boolean' },
          hasActiveContract: { type: 'boolean' },
          creditOverLimit: { type: 'boolean' },
          contractExpiring: { type: 'boolean' },
          expiringDays: { type: 'integer', minimum: 1, maximum: 365 },
          sortBy: { 
            type: 'string',
            enum: ['companyName', 'businessType', 'createdAt', 'updatedAt'],
            default: 'companyName'
          },
          sortOrder: { 
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
          }
        }
      },
      response: {
        200: clientsListResponseSchema
      }
    }
  }, clientController.getAll.bind(clientController));

  // GET /api/clients/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get client by ID',
      tags: ['clients'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: clientResponseSchema,
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, clientController.getById.bind(clientController));

  // POST /api/clients
  fastify.post('/', {
    schema: {
      description: 'Create a new client',
      tags: ['clients'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: [
          'companyName', 'businessType', 'primaryContact', 
          'billingAddress', 'creditTerms'
        ],
        properties: {
          companyName: { type: 'string', minLength: 2, maxLength: 200 },
          businessType: { 
            type: 'string',
            enum: [
              'CORPORATE', 'SALON_CHAIN', 'HOTEL_SPA', 'WEDDING_PLANNER',
              'EVENT_ORGANIZER', 'BEAUTY_SCHOOL', 'FRANCHISE', 'WHOLESALER', 'OTHER'
            ]
          },
          registrationNumber: { type: 'string', maxLength: 50 },
          taxId: { type: 'string', maxLength: 50 },
          website: { type: 'string', format: 'uri' },
          primaryContact: {
            type: 'object',
            required: ['name', 'position', 'email', 'phone'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              position: { type: 'string', minLength: 2, maxLength: 100 },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string', minLength: 7, maxLength: 20 }
            }
          },
          secondaryContacts: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'position', 'email', 'phone'],
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 100 },
                position: { type: 'string', minLength: 2, maxLength: 100 },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string', minLength: 7, maxLength: 20 }
              }
            }
          },
          billingAddress: { type: 'string', minLength: 10, maxLength: 500 },
          shippingAddress: { type: 'string', maxLength: 500 },
          creditTerms: {
            type: 'object',
            required: ['paymentTerms', 'creditLimit', 'discountPercent'],
            properties: {
              paymentTerms: { 
                type: 'string',
                enum: ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'CUSTOM', 'COD']
              },
              creditLimit: { type: 'number', minimum: 0, maximum: 1000000 },
              discountPercent: { type: 'number', minimum: 0, maximum: 50 },
              customTermsDays: { type: 'integer', minimum: 1, maximum: 365 }
            }
          },
          contractStartDate: { type: 'string', format: 'date' },
          contractEndDate: { type: 'string', format: 'date' },
          notes: { type: 'string', maxLength: 1000 },
          metadata: { type: 'object' }
        }
      },
      response: {
        201: clientResponseSchema,
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            field: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, clientController.create.bind(clientController));

  // PUT /api/clients/:id (placeholder)
  fastify.put('/:id', {
    schema: {
      description: 'Update client (not yet implemented)',
      tags: ['clients'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        501: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, clientController.update.bind(clientController));

  // DELETE /api/clients/:id (placeholder)
  fastify.delete('/:id', {
    schema: {
      description: 'Delete client (not yet implemented)',
      tags: ['clients'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        501: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, clientController.delete.bind(clientController));
} 