import { PrismaClient } from '@prisma/client';

// Infrastructure
import { CustomerRepository } from '../infrastructure/database/repositories/CustomerRepository';
import { CustomerController } from '../infrastructure/web/controllers/CustomerController';

// Application Use Cases
import { CreateCustomer } from '../application/use-cases/customer/CreateCustomer';
import { GetCustomers } from '../application/use-cases/customer/GetCustomers';
import { GetCustomerById } from '../application/use-cases/customer/GetCustomerById';

// Domain Interfaces
import { ICustomerRepository } from '../domain/repositories/ICustomerRepository';

export class Container {
  private static instance: Container;
  private _prisma: PrismaClient;
  private _customerRepository: ICustomerRepository;
  private _createCustomer: CreateCustomer;
  private _getCustomers: GetCustomers;
  private _getCustomerById: GetCustomerById;
  private _customerController: CustomerController;

  private constructor() {
    // Initialize Prisma
    this._prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Infrastructure Layer - Repository
    this._customerRepository = new CustomerRepository(this._prisma);

    // Application Layer - Use Cases
    this._createCustomer = new CreateCustomer(this._customerRepository);
    this._getCustomers = new GetCustomers(this._customerRepository);
    this._getCustomerById = new GetCustomerById(this._customerRepository);

    // Infrastructure Layer - Controller
    this._customerController = new CustomerController(
      this._createCustomer,
      this._getCustomers,
      this._getCustomerById
    );
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Getters for dependencies
  public get prisma(): PrismaClient {
    return this._prisma;
  }

  public get customerRepository(): ICustomerRepository {
    return this._customerRepository;
  }

  public get createCustomer(): CreateCustomer {
    return this._createCustomer;
  }

  public get getCustomers(): GetCustomers {
    return this._getCustomers;
  }

  public get getCustomerById(): GetCustomerById {
    return this._getCustomerById;
  }

  public get customerController(): CustomerController {
    return this._customerController;
  }

  // Cleanup method
  public async disconnect(): Promise<void> {
    await this._prisma.$disconnect();
  }

  // Database connection test
  public async connectDB(): Promise<void> {
    try {
      await this._prisma.$connect();
      console.log('✅ Database connected successfully (Clean Architecture)');
      
      // Run a simple query to test the connection
      await this._prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database query test passed (TypeScript)');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
} 