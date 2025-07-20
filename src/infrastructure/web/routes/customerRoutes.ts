import { FastifyInstance } from 'fastify';
import { CustomerController } from '../controllers/CustomerController';

// Request/Response schemas for Swagger documentation
const customerCreateSchema = {
  type: 'object',
  required: ['name', 'email', 'phone'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^[+]?[1-9]\\d{1,14}$' },
    whatsappId: { type: 'string' },
    avatar: { type: 'string', format: 'uri' },
    preferences: { type: 'string', maxLength: 500 }
  },
  additionalProperties: false
};

const customerResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    whatsappId: { type: 'string' },
    avatar: { type: 'string' },
    loyaltyPoints: { type: 'integer' },
    loyaltyTier: { type: 'string' },
    discountPercentage: { type: 'number' },
    totalVisits: { type: 'integer' },
    lastVisit: { type: 'string', format: 'date-time' },
    preferences: { type: 'string' },
    metadata: { type: 'object' },
    isActive: { type: 'boolean' },
    isVip: { type: 'boolean' },
    daysSinceLastVisit: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const customersListResponseSchema = {
  type: 'object',
  properties: {
    customers: {
      type: 'array',
      items: customerResponseSchema
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        pages: { type: 'integer' }
      }
    }
  }
};

export async function customerRoutes(
  fastify: FastifyInstance, 
  options: { customerController: CustomerController }
) {
  const { customerController } = options;

  // GET /api/customers
  fastify.get('/', {
    schema: {
      description: 'Get all customers with pagination and search',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          whatsappId: { type: 'string' },
          isActive: { type: 'boolean' },
          loyaltyTier: { 
            type: 'string', 
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] 
          },
          minLoyaltyPoints: { type: 'integer' },
          maxLoyaltyPoints: { type: 'integer' },
          lastVisitAfter: { type: 'string', format: 'date' },
          lastVisitBefore: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: customersListResponseSchema
      }
    }
  }, customerController.getAll.bind(customerController));

  // GET /api/customers/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get customer by ID',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: customerResponseSchema,
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, customerController.getById.bind(customerController));

  // POST /api/customers
  fastify.post('/', {
    schema: {
      description: 'Create new customer',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      body: customerCreateSchema,
      response: {
        201: customerResponseSchema,
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
  }, customerController.create.bind(customerController));

  // PUT /api/customers/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update customer',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', pattern: '^[+]?[1-9]\\d{1,14}$' },
          whatsappId: { type: 'string' },
          avatar: { type: 'string', format: 'uri' },
          preferences: { type: 'string', maxLength: 500 }
        },
        additionalProperties: false
      },
      response: {
        200: customerResponseSchema,
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, customerController.update.bind(customerController));

  // DELETE /api/customers/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete customer',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        204: {
          type: 'null'
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, customerController.delete.bind(customerController));
} 