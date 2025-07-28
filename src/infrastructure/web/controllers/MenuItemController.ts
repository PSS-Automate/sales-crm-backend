import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMenuItem } from '../../../application/use-cases/menu/CreateMenuItem';
import { GetMenuItems } from '../../../application/use-cases/menu/GetMenuItems';
import { GetMenuItemById } from '../../../application/use-cases/menu/GetMenuItemById';
import { 
  CreateMenuItemRequestDto, 
  GetMenuItemsFilterDto
} from '../../../application/dtos/MenuItemDto';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '../../../shared/errors/DomainError';

export class MenuItemController {
  constructor(
    private createMenuItem: CreateMenuItem,
    private getMenuItems: GetMenuItems,
    private getMenuItemById: GetMenuItemById
  ) {}

  /**
   * GET /api/menu-items
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetMenuItemsFilterDto;
      
      const result = await this.getMenuItems.execute(query);
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * GET /api/menu-items/:id
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      const result = await this.getMenuItemById.execute({ id });
      
      return reply.code(200).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * POST /api/menu-items
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createDto = request.body as CreateMenuItemRequestDto;
      
      const result = await this.createMenuItem.execute(createDto);
      
      return reply.code(201).send(result);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * PUT /api/menu-items/:id
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      // Note: We haven't implemented UpdateMenuItem use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Update menu item functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * DELETE /api/menu-items/:id
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      // Note: We haven't implemented DeleteMenuItem use case yet
      // This is a placeholder for now
      return reply.code(501).send({
        error: 'Not Implemented',
        message: 'Delete menu item functionality not yet implemented'
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * GET /api/menu-items/categories
   */
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Return available menu categories
      const categories = [
        'HAIR_CARE', 'NAIL_CARE', 'SKIN_CARE', 'MASSAGE', 'MAKEUP',
        'HAIR_STYLING', 'TREATMENTS', 'PACKAGES', 'CONSULTATIONS'
      ].map(category => ({
        value: category,
        displayName: category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        description: `${category.replace(/_/g, ' ').toLowerCase()} services`
      }));
      
      return reply.code(200).send({ categories });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Error handler for consistent error responses
   */
  private handleError(error: any, reply: FastifyReply): FastifyReply {
    console.error('MenuItemController Error:', error);

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