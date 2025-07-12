const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Connection test
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Run a simple query to test the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query test passed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };
