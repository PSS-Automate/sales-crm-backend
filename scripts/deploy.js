const { execSync } = require('child_process');

async function deploy() {
  try {
    console.log('🚀 Starting deployment process...');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run database migrations in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🗄️  Running database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
    
    console.log('✅ Deployment completed successfully!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy(); 