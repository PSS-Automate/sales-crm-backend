const fastify = require('fastify')({
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

// Environment variables
require('dotenv').config();

// Database connection
const { connectDB } = require('./config/database');

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
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000
  });

  // JWT
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  });

  // Swagger documentation
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Salon CRM API',
        description: 'API for Salon Customer Relationship Management',
        version: '1.0.0'
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

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
  await fastify.register(require('./routes/customers'), { prefix: '/api/customers' });
}

// Authentication decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
});

// Initialize app
async function start() {
  try {
    // Connect to database
    await connectDB();
    
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();
    
    // Start server
    const port = process.env.PORT || 3001;
    await fastify.listen({ 
      port: port, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 Salon CRM API Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

start();
