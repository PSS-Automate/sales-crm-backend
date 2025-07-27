import Fastify, { FastifyInstance } from 'fastify';
import { Container } from './container/Container';
import { customerRoutes } from './infrastructure/web/routes/customerRoutes';
import { productRoutes } from './infrastructure/web/routes/productRoutes';

// Environment variables
require('dotenv').config();

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  },
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: 'array'
    }
  }
});

// Initialize dependency injection container
const container = Container.getInstance();

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  });

  // Security
  await fastify.register(require('@fastify/helmet'));

  // Rate limiting
  await fastify.register(require('@fastify/rate-limit'), {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
  });

  // JWT
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  });

  // Swagger documentation
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Salon CRM API (Clean Architecture)',
        description: 'TypeScript API for Salon Customer Relationship Management with Clean Architecture',
        version: '2.0.0'
      },
      host: `localhost:${process.env.PORT || 3001}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });
}

// Authentication decorator
fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // For demo purposes, we'll allow unauthenticated access
    // In production, you'd want to enforce authentication
    console.log('⚠️  Authentication skipped for demo purposes');
  }
});

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      architecture: 'Clean Architecture',
      language: 'TypeScript',
      timestamp: new Date().toISOString() 
    };
  });

  // Auth routes (keeping the simple one from before for now)
  fastify.post('/api/auth/login', {
    schema: {
      description: 'User login (demo)',
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
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    
    // Simple demo authentication
    const adminEmail = 'admin@salon.com';
    const adminPassword = 'admin123';
    
    if (email === adminEmail && password === adminPassword) {
      const token = (fastify as any).jwt.sign({ 
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
  });

  // Customer routes with Clean Architecture
  await fastify.register(customerRoutes, {
    prefix: '/api/customers',
    customerController: container.customerController
  });

  // Product routes with Clean Architecture
  await fastify.register(productRoutes, {
    prefix: '/api',
    productController: container.productController
  });
}

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.validation
    });
    return;
  }
  
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  
  try {
    await container.disconnect();
    console.log('✅ Database disconnected');
    
    await fastify.close();
    console.log('✅ Server closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Initialize and start the application
async function start() {
  try {
    // Connect to database using Clean Architecture
    await container.connectDB();
    
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();
    
    // Start server
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ 
      port: port, 
      host: '0.0.0.0' 
    });
    
    console.log('');
    console.log('🎉 ===============================================');
    console.log('🚀 Salon CRM API Server (Clean Architecture)');
    console.log('📊 TypeScript + Domain-Driven Design');
    console.log('🏗️  Clean Architecture Implementation');
    console.log('===============================================');
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📚 API Docs: http://localhost:${port}/docs`);
    console.log(`💚 Health Check: http://localhost:${port}/health`);
    console.log('===============================================');
    console.log('');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Start the server
start().catch(console.error); 