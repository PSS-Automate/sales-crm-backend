import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateClient } from '../../../application/use-cases/client/CreateClient';
import { GetClients } from '../../../application/use-cases/client/GetClients';
import { GetClientById } from '../../../application/use-cases/client/GetClientById';
import { 
  CreateClientRequestDto, 
  GetClientsFilterDto
} from '../../../application/dtos/ClientDto';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '../../../shared/errors/DomainError';

export class ClientController {
  constructor(
    private createClient: CreateClient,
    private getClients: GetClients,
    private getClientById: GetClientById
  ) {}

  /**
   * GET /api/clients
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetClientsFilterDto;
      
      const result = await this.getClients.execute(query);
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * GET /api/clients/:id
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      const result = await this.getClientById.execute({ id });
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * POST /api/clients
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createDto = request.body as CreateClientRequestDto;
      
      const result = await this.createClient.execute(createDto);
      
      return reply.code(201).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * PUT /api/clients/:id
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      // Note: We haven't implemented UpdateClient use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Update client functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * DELETE /api/clients/:id
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      // Note: We haven't implemented DeleteClient use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Delete client functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Error handler for consistent error responses
   */
  private handleError(error: any, reply: FastifyReply): FastifyReply {
    console.error('ClientController Error:', error);

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