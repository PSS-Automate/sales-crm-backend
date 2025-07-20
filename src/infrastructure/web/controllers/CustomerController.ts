import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCustomer } from '../../../application/use-cases/customer/CreateCustomer';
import { GetCustomers } from '../../../application/use-cases/customer/GetCustomers';
import { GetCustomerById } from '../../../application/use-cases/customer/GetCustomerById';
import { 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CustomerSearchDto 
} from '../../../application/dtos/CustomerDto';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '../../../shared/errors/DomainError';

export class CustomerController {
  constructor(
    private createCustomer: CreateCustomer,
    private getCustomers: GetCustomers,
    private getCustomerById: GetCustomerById
  ) {}

  /**
   * GET /api/customers
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as CustomerSearchDto;
      
      const result = await this.getCustomers.execute(query);
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * GET /api/customers/:id
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      const result = await this.getCustomerById.execute({ id });
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * POST /api/customers
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createDto = request.body as CreateCustomerDto;
      
      const result = await this.createCustomer.execute(createDto);
      
      return reply.code(201).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * PUT /api/customers/:id
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateDto = request.body as UpdateCustomerDto;
      
      // Note: We haven't implemented UpdateCustomer use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Update customer functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * DELETE /api/customers/:id
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      // Note: We haven't implemented DeleteCustomer use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Delete customer functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Error handling
   */
  private handleError(error: any, reply: FastifyReply) {
    console.error('Controller error:', error);

    if (error instanceof ValidationError) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
        field: error.field
      });
    }

    if (error instanceof NotFoundError) {
      return reply.code(404).send({
        error: 'Not Found',
        message: error.message
      });
    }

    if (error instanceof ConflictError) {
      return reply.code(409).send({
        error: 'Conflict',
        message: error.message
      });
    }

    // Generic server error
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
} 