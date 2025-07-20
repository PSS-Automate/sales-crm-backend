# Salon CRM Backend

A comprehensive backend API for Salon Customer Relationship Management System built with Fastify, Prisma, and PostgreSQL.

## Features

- 🔐 JWT Authentication
- 👥 Customer Management
- 📊 RESTful API with Swagger Documentation
- 🛡️ Security with Helmet and Rate Limiting
- 🔄 CORS Support
- 📝 Request Validation with AJV
- 🗄️ Database with Prisma ORM

## Tech Stack

- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest

## Local Development

### Prerequisites

- Node.js 16+ 
- npm or yarn
- PostgreSQL (local for development, hosted for production)

### Setup Options

#### Option 1: Local PostgreSQL (Recommended for Development) 🏠

**Advantages:**
- ✅ No costs or usage limits
- ✅ Works offline
- ✅ Fast local development
- ✅ No network latency

**Setup:**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb salon_crm_dev

# Or using psql
psql -c "CREATE DATABASE salon_crm_dev;"
```

#### Option 2: Hosted Development Database 🌐

**Advantages:**
- ✅ Same environment as production
- ✅ Team collaboration
- ✅ No local setup required

**Setup:**
- Create a separate PostgreSQL database on Render/Supabase
- Use it only for development/testing

### Environment Configuration

1. **For Local Development:**
```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/salon_crm_dev"
NODE_ENV=development
```

2. **For Production:**
```bash
# Render environment variables
DATABASE_URL="postgresql://prod_user:pass@host:5432/salon_crm_prod"
NODE_ENV=production
```

### Database Setup

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`
API Documentation will be available at `http://localhost:3001/docs`

## Deployment on Render

### Method 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and set up:
   - Web service with Node.js environment
   - PostgreSQL database
   - Environment variables

### Method 2: Manual Setup

1. **Create a PostgreSQL Database:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., `salon-crm-db`)
   - Select the Free plan
   - Note the connection string

2. **Create a Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Environment:** Node

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=<your-secure-random-string>
   FRONTEND_URL=<your-frontend-url>
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=60000
   LOG_LEVEL=info
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `RATE_LIMIT_MAX` | Maximum requests per window | No |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | No |
| `LOG_LEVEL` | Logging level | No |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - Get all customers (with pagination and search)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Health Check
- `GET /health` - API health status

## Database

### Why PostgreSQL?

For a **WhatsApp bot sales CRM**, PostgreSQL is the ideal choice because:

- **JSON Support**: Perfect for storing WhatsApp message data, user preferences, and dynamic form data
- **Full-text Search**: Search through customer conversations and messages
- **ACID Compliance**: Ensures data integrity for sales transactions and customer data
- **Scalability**: Handles thousands of concurrent WhatsApp users
- **Advanced Features**: Arrays, JSONB, custom functions for complex CRM logic
- **Production Ready**: Used by companies like Instagram, Spotify, and Reddit

### Recommended Database Providers

1. **Render PostgreSQL** (Free tier available)
   - Managed service with automatic backups
   - Easy integration with your web service
   - Good for startups and small businesses

2. **Supabase** (PostgreSQL + real-time features)
   - Real-time subscriptions for live chat updates
   - Built-in authentication and storage
   - Excellent for WhatsApp bot integrations

3. **PlanetScale** (MySQL-compatible, but with PostgreSQL-like features)
   - Branching for database schema changes
   - Excellent scaling capabilities

## Database Schema

The application uses the following main entities:
- **Customer** - Customer information and loyalty data
- **Staff** - Staff members and their specialties
- **Service** - Services offered by the salon
- **Branch** - Salon branch locations
- **Appointment** - Customer appointments
- **Review** - Customer reviews and ratings

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs migrations and generates client)
- `npm run deploy` - Deploy script for production
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Troubleshooting

### Common Issues

1. **Prisma Client Not Generated**
   ```bash
   npm run db:generate
   ```

2. **Database Connection Issues**
   - Check your `DATABASE_URL` environment variable
   - Ensure PostgreSQL is running (for production)
   - Verify connection string format

3. **Migration Issues**
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

### Render Deployment Issues

1. **Build Fails:** Check that all dependencies are in `package.json`
2. **Database Connection:** Verify `DATABASE_URL` is set correctly
3. **Prisma Client:** Ensure `postinstall` script runs `prisma generate`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 