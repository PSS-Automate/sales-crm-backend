import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/ProductController';

export async function productRoutes(
  fastify: FastifyInstance, 
  options: { productController: ProductController }
) {
  const { productController } = options;
  // Apply authentication to all product routes
  fastify.addHook('preHandler', (fastify as any).authenticate);

  // Product CRUD endpoints
  fastify.post('/products', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'price', 'category', 'type'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          description: { type: 'string', minLength: 10, maxLength: 500 },
          price: { type: 'number', minimum: 0.01, maximum: 999999.99 },
          category: { 
            type: 'string',
            enum: [
              'HAIR_SERVICES', 'NAIL_SERVICES', 'FACIAL_SERVICES', 'BODY_SERVICES',
              'HAIR_PRODUCTS', 'NAIL_PRODUCTS', 'SKINCARE_PRODUCTS', 
              'TOOLS_EQUIPMENT', 'ACCESSORIES', 'PACKAGES'
            ]
          },
          type: { 
            type: 'string',
            enum: ['SERVICE', 'PHYSICAL_PRODUCT', 'PACKAGE']
          },
          durationMinutes: { type: 'integer', minimum: 5, maximum: 480 },
          stockLevel: { type: 'integer', minimum: 0 },
          lowStockThreshold: { type: 'integer', minimum: 0 },
          metadata: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            priceFormatted: { type: 'string' },
            category: { type: 'string' },
            categoryDisplayName: { type: 'string' },
            type: { type: 'string' },
            typeDisplayName: { type: 'string' },
            sku: { type: 'string' },
            isActive: { type: 'boolean' },
            durationMinutes: { type: 'integer' },
            durationFormatted: { type: 'string' },
            stockLevel: { type: 'integer' },
            lowStockThreshold: { type: 'integer' },
            isOutOfStock: { type: 'boolean' },
            isLowStock: { type: 'boolean' },
            canBeOrdered: { type: 'boolean' },
            metadata: { type: 'object' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, productController.create.bind(productController));

  fastify.get('/products', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          category: { 
            type: 'string',
            enum: [
              'HAIR_SERVICES', 'NAIL_SERVICES', 'FACIAL_SERVICES', 'BODY_SERVICES',
              'HAIR_PRODUCTS', 'NAIL_PRODUCTS', 'SKINCARE_PRODUCTS', 
              'TOOLS_EQUIPMENT', 'ACCESSORIES', 'PACKAGES'
            ]
          },
          type: { 
            type: 'string',
            enum: ['SERVICE', 'PHYSICAL_PRODUCT', 'PACKAGE']
          },
          isActive: { type: 'boolean' },
          priceMin: { type: 'number', minimum: 0 },
          priceMax: { type: 'number', minimum: 0 },
          inStock: { type: 'boolean' },
          lowStock: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          sortBy: { 
            type: 'string',
            enum: ['name', 'price', 'createdAt', 'updatedAt'],
            default: 'name'
          },
          sortOrder: { 
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  priceFormatted: { type: 'string' },
                  category: { type: 'string' },
                  categoryDisplayName: { type: 'string' },
                  type: { type: 'string' },
                  typeDisplayName: { type: 'string' },
                  sku: { type: 'string' },
                  isActive: { type: 'boolean' },
                  canBeOrdered: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
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
        }
      }
    }
  }, productController.getAll.bind(productController));

  fastify.get('/products/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            priceFormatted: { type: 'string' },
            category: { type: 'string' },
            categoryDisplayName: { type: 'string' },
            type: { type: 'string' },
            typeDisplayName: { type: 'string' },
            sku: { type: 'string' },
            isActive: { type: 'boolean' },
            durationMinutes: { type: 'integer' },
            durationFormatted: { type: 'string' },
            stockLevel: { type: 'integer' },
            lowStockThreshold: { type: 'integer' },
            isOutOfStock: { type: 'boolean' },
            isLowStock: { type: 'boolean' },
            canBeOrdered: { type: 'boolean' },
            metadata: { type: 'object' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, productController.getById.bind(productController));

  // Business operation endpoints
  fastify.put('/products/:id/restock', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 }
        }
      },
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1, maximum: 10000 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            stockLevel: { type: 'integer' },
            isOutOfStock: { type: 'boolean' },
            isLowStock: { type: 'boolean' },
            canBeOrdered: { type: 'boolean' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, productController.restock.bind(productController));

  // Information endpoints
  fastify.get('/products/meta/categories', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  displayName: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, productController.getCategories.bind(productController));

  fastify.get('/products/meta/types', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            types: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  displayName: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, productController.getTypes.bind(productController));
} 