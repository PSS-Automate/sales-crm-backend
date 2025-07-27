import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateProduct, GetProducts, GetProductById, RestockProduct } from '../../../application/use-cases/product';
import { 
  CreateProductRequestDto, 
  UpdateProductRequestDto, 
  RestockProductRequestDto,
  ProductSearchRequestDto,
  ProductDtoValidator 
} from '../../../application/dtos/ProductDto';
import { ValidationError, NotFoundError, ConflictError, BusinessRuleViolationError } from '@shared/errors/DomainError';

export class ProductController {
  constructor(
    private createProduct: CreateProduct,
    private getProducts: GetProducts,
    private getProductById: GetProductById,
    private restockProduct: RestockProduct
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as CreateProductRequestDto;
      
      // Validate request
      const validation = ProductDtoValidator.validateCreateProduct(body);
      if (!validation.isValid) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: validation.errors
        });
      }

      const product = await this.createProduct.execute(body);
      
      reply.status(201).send(product);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as ProductSearchRequestDto;
      
      // Validate search parameters
      const validation = ProductDtoValidator.validateSearch(query);
      if (!validation.isValid) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Search parameters validation failed',
          details: validation.errors
        });
      }

      const result = await this.getProducts.execute(query);
      
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      if (!id) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Product ID is required'
        });
      }

      const product = await this.getProductById.execute(id);
      
      reply.send(product);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async restock(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as RestockProductRequestDto;
      
      if (!id) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Product ID is required'
        });
      }

      // Validate restock request
      const validation = ProductDtoValidator.validateRestock(body);
      if (!validation.isValid) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Restock request validation failed',
          details: validation.errors
        });
      }

      const product = await this.restockProduct.execute({
        productId: id,
        request: body
      });
      
      reply.send(product);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  // Additional endpoints for business operations
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Return available product categories
      const categories = [
        { value: 'HAIR_SERVICES', displayName: 'Hair Services', description: 'Hair cutting, styling, and coloring services' },
        { value: 'NAIL_SERVICES', displayName: 'Nail Services', description: 'Manicure, pedicure, and nail art services' },
        { value: 'FACIAL_SERVICES', displayName: 'Facial Services', description: 'Facial treatments and skincare services' },
        { value: 'BODY_SERVICES', displayName: 'Body Services', description: 'Massage and body treatment services' },
        { value: 'HAIR_PRODUCTS', displayName: 'Hair Products', description: 'Shampoos, conditioners, and styling products' },
        { value: 'NAIL_PRODUCTS', displayName: 'Nail Products', description: 'Nail polish, treatments, and accessories' },
        { value: 'SKINCARE_PRODUCTS', displayName: 'Skincare Products', description: 'Cleansers, moisturizers, and treatments' },
        { value: 'TOOLS_EQUIPMENT', displayName: 'Tools & Equipment', description: 'Professional salon tools and equipment' },
        { value: 'ACCESSORIES', displayName: 'Accessories', description: 'Hair accessories and styling tools' },
        { value: 'PACKAGES', displayName: 'Packages', description: 'Service packages and bundles' }
      ];
      
      reply.send({ categories });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getTypes(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Return available product types
      const types = [
        { value: 'SERVICE', displayName: 'Service', description: 'A service performed by salon staff' },
        { value: 'PHYSICAL_PRODUCT', displayName: 'Physical Product', description: 'A physical item sold to customers' },
        { value: 'PACKAGE', displayName: 'Package', description: 'A bundle of services or products' }
      ];
      
      reply.send({ types });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: any, reply: FastifyReply) {
    console.error('ProductController Error:', error);

    if (error instanceof ValidationError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        field: error.field
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: error.message
      });
    }

    if (error instanceof ConflictError) {
      return reply.status(409).send({
        error: 'Conflict',
        message: error.message
      });
    }

    if (error instanceof BusinessRuleViolationError) {
      return reply.status(422).send({
        error: 'Business Rule Violation',
        message: error.message
      });
    }

    // Generic server error
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
} 