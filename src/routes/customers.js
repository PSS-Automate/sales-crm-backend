const { customerService } = require('../services/customerService');
const { 
  customerCreateSchema, 
  customerUpdateSchema, 
  customerResponseSchema,
  customersListResponseSchema
} = require('../schemas/customerSchemas');

async function customerRoutes(fastify, options) {
  const opts = {
    preHandler: fastify.authenticate
  };

  // GET /api/customers
  fastify.get('/', {
    ...opts,
    schema: {
      description: 'Get all customers with pagination and search',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string' }
        }
      },
      response: {
        200: customersListResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 10, search } = request.query;
      const result = await customerService.getAll({ page, limit, search });
      
      reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch customers'
      });
    }
  });

  // GET /api/customers/:id
  fastify.get('/:id', {
    ...opts,
    schema: {
      description: 'Get customer by ID with appointments and reviews',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
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
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const customer = await customerService.getById(id);
      
      if (!customer) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }
      
      reply.code(200).send(customer);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch customer'
      });
    }
  });

  // POST /api/customers
  fastify.post('/', {
    ...opts,
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
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const customerData = request.body;
      const customer = await customerService.create(customerData);
      
      reply.code(201).send(customer);
    } catch (error) {
      request.log.error(error);
      
      if (error.code === 'P2002') {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Email already exists'
        });
      }
      
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create customer'
      });
    }
  });

  // PUT /api/customers/:id
  fastify.put('/:id', {
    ...opts,
    schema: {
      description: 'Update customer',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: customerUpdateSchema,
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
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      const customer = await customerService.update(id, updateData);
      
      if (!customer) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }
      
      reply.code(200).send(customer);
    } catch (error) {
      request.log.error(error);
      
      if (error.code === 'P2002') {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Email already exists'
        });
      }
      
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update customer'
      });
    }
  });

  // DELETE /api/customers/:id
  fastify.delete('/:id', {
    ...opts,
    schema: {
      description: 'Delete customer',
      tags: ['customers'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        204: {},
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await customerService.delete(id);
      
      if (!deleted) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }
      
      reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete customer'
      });
    }
  });
}

module.exports = customerRoutes;
