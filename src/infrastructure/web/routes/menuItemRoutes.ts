import { FastifyInstance } from 'fastify';
import { MenuItemController } from '../controllers/MenuItemController';

export async function menuItemRoutes(
  fastify: FastifyInstance, 
  options: { menuItemController: MenuItemController }
) {
  const { menuItemController } = options;

  // Apply authentication to all menu item routes
  fastify.addHook('preHandler', (fastify as any).authenticate);

  // GET /api/menu-items
  fastify.get('/', {
    schema: {
      description: 'Get all menu items with pagination and filtering',
      tags: ['menu-items'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string' },
          category: { 
            type: 'string',
            enum: [
              'HAIR_CARE', 'NAIL_CARE', 'SKIN_CARE', 'MASSAGE', 'MAKEUP',
              'HAIR_STYLING', 'TREATMENTS', 'PACKAGES', 'CONSULTATIONS'
            ]
          },
          isActive: { type: 'boolean' },
          isPackage: { type: 'boolean' },
          availableOnline: { type: 'boolean' },
          seasonalItem: { type: 'boolean' },
          advanceBookingRequired: { type: 'boolean' },
          minPrice: { type: 'number', minimum: 0 },
          maxPrice: { type: 'number', minimum: 0 },
          minDuration: { type: 'integer', minimum: 5 },
          maxDuration: { type: 'integer', minimum: 5 },
          tags: { type: 'string' },
          sortBy: { 
            type: 'string',
            enum: ['name', 'price', 'duration', 'displayOrder', 'createdAt'],
            default: 'displayOrder'
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
            menuItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  categoryDisplay: { type: 'string' },
                  duration: { type: 'integer' },
                  durationDisplay: { type: 'string' },
                  price: { type: 'number' },
                  priceDisplay: { type: 'string' },
                  isPackage: { type: 'boolean' },
                  availableOnline: { type: 'boolean' },
                  isAvailableToday: { type: 'boolean' },
                  displayOrder: { type: 'integer' },
                  imageUrl: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        }
      }
    }
  }, menuItemController.getAll.bind(menuItemController));

  // GET /api/menu-items/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get menu item by ID',
      tags: ['menu-items'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            categoryDisplay: { type: 'string' },
            duration: { type: 'integer' },
            durationDisplay: { type: 'string' },
            price: { type: 'number' },
            priceDisplay: { type: 'string' },
            isPackage: { type: 'boolean' },
            includedServices: { type: 'array', items: { type: 'string' } },
            requirements: { type: 'array', items: { type: 'string' } },
            benefits: { type: 'array', items: { type: 'string' } },
            advanceBookingRequired: { type: 'boolean' },
            advanceBookingDays: { type: 'integer' },
            availableOnline: { type: 'boolean' },
            canBookOnline: { type: 'boolean' },
            displayOrder: { type: 'integer' },
            imageUrl: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            seasonalItem: { type: 'boolean' },
            validFrom: { type: 'string' },
            validTo: { type: 'string' },
            isAvailableToday: { type: 'boolean' },
            maxBookingsPerDay: { type: 'integer' },
            metadata: { type: 'object' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
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
  }, menuItemController.getById.bind(menuItemController));

  // POST /api/menu-items
  fastify.post('/', {
    schema: {
      description: 'Create a new menu item',
      tags: ['menu-items'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'description', 'category', 'duration', 'price'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 200 },
          description: { type: 'string', minLength: 10, maxLength: 1000 },
          category: { 
            type: 'string',
            enum: [
              'HAIR_CARE', 'NAIL_CARE', 'SKIN_CARE', 'MASSAGE', 'MAKEUP',
              'HAIR_STYLING', 'TREATMENTS', 'PACKAGES', 'CONSULTATIONS'
            ]
          },
          duration: { type: 'integer', minimum: 15, maximum: 480, multipleOf: 15 },
          price: { type: 'number', minimum: 0.01, maximum: 999999.99 },
          isPackage: { type: 'boolean', default: false },
          includedServices: { type: 'array', items: { type: 'string' } },
          requirements: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'string' } },
          advanceBookingRequired: { type: 'boolean', default: false },
          advanceBookingDays: { type: 'integer', minimum: 1, maximum: 30 },
          availableOnline: { type: 'boolean', default: true },
          displayOrder: { type: 'integer', minimum: 1 },
          imageUrl: { type: 'string', format: 'uri' },
          tags: { type: 'array', items: { type: 'string' } },
          seasonalItem: { type: 'boolean', default: false },
          validFrom: { type: 'string', format: 'date' },
          validTo: { type: 'string', format: 'date' },
          maxBookingsPerDay: { type: 'integer', minimum: 1, maximum: 100 },
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
            category: { type: 'string' },
            categoryDisplay: { type: 'string' },
            duration: { type: 'integer' },
            durationDisplay: { type: 'string' },
            price: { type: 'number' },
            priceDisplay: { type: 'string' },
            isPackage: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
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
  }, menuItemController.create.bind(menuItemController));

  // GET /api/menu-items/categories
  fastify.get('/categories', {
    schema: {
      description: 'Get all available menu item categories',
      tags: ['menu-items'],
      security: [{ bearerAuth: [] }],
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
  }, menuItemController.getCategories.bind(menuItemController));

  // PUT /api/menu-items/:id (placeholder)
  fastify.put('/:id', {
    schema: {
      description: 'Update menu item (not yet implemented)',
      tags: ['menu-items'],
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
  }, menuItemController.update.bind(menuItemController));

  // DELETE /api/menu-items/:id (placeholder)
  fastify.delete('/:id', {
    schema: {
      description: 'Delete menu item (not yet implemented)',
      tags: ['menu-items'],
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
  }, menuItemController.delete.bind(menuItemController));
} 