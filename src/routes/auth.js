const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

async function authRoutes(fastify, options) {
  // Login route
  fastify.post('/login', {
    schema: {
      description: 'User login',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        401: {
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
      const { email, password } = request.body;
      
      // For now, we'll create a simple admin login
      const adminEmail = 'admin@salon.com';
      const adminPassword = 'admin123';
      
      if (email === adminEmail && password === adminPassword) {
        const token = fastify.jwt.sign({ 
          id: 'admin',
          email: adminEmail,
          role: 'admin'
        });
        
        return reply.code(200).send({
          token,
          user: {
            id: 'admin',
            email: adminEmail,
            name: 'Admin User'
          }
        });
      }
      
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
  });

  // Get current user profile
  fastify.get('/profile', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      return reply.code(200).send({
        id: user.id,
        email: user.email,
        name: user.name || 'Admin User',
        role: user.role || 'admin'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get profile'
      });
    }
  });

  // Logout
  fastify.post('/logout', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'User logout',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return reply.code(200).send({
      message: 'Logged out successfully'
    });
  });
}

module.exports = authRoutes;
