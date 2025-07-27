import { PrismaClient } from '@prisma/client';

// Infrastructure
import { CustomerRepository } from '../infrastructure/database/repositories/CustomerRepository';
import { CustomerController } from '../infrastructure/web/controllers/CustomerController';
import { ProductRepository } from '../infrastructure/database/repositories/ProductRepository';
import { ProductController } from '../infrastructure/web/controllers/ProductController';

// Application Use Cases
import { CreateCustomer } from '../application/use-cases/customer/CreateCustomer';
import { GetCustomers } from '../application/use-cases/customer/GetCustomers';
import { GetCustomerById } from '../application/use-cases/customer/GetCustomerById';
import { CreateProduct } from '../application/use-cases/product/CreateProduct';
import { GetProducts } from '../application/use-cases/product/GetProducts';
import { GetProductById } from '../application/use-cases/product/GetProductById';
import { RestockProduct } from '../application/use-cases/product/RestockProduct';

// Domain Interfaces
import { ICustomerRepository } from '../domain/repositories/ICustomerRepository';
import { IProductRepository } from '../domain/repositories/IProductRepository';

export class Container {
  private static instance: Container;
  private _prisma: PrismaClient;
  private _customerRepository: ICustomerRepository;
  private _createCustomer: CreateCustomer;
  private _getCustomers: GetCustomers;
  private _getCustomerById: GetCustomerById;
  private _customerController: CustomerController;
  private _productRepository: IProductRepository;
  private _createProduct: CreateProduct;
  private _getProducts: GetProducts;
  private _getProductById: GetProductById;
  private _restockProduct: RestockProduct;
  private _productController: ProductController;

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

    // Product Dependencies
    // Infrastructure Layer - Repository
    this._productRepository = new ProductRepository(this._prisma);

    // Application Layer - Use Cases
    this._createProduct = new CreateProduct(this._productRepository);
    this._getProducts = new GetProducts(this._productRepository);
    this._getProductById = new GetProductById(this._productRepository);
    this._restockProduct = new RestockProduct(this._productRepository);

    // Infrastructure Layer - Controller
    this._productController = new ProductController(
      this._createProduct,
      this._getProducts,
      this._getProductById,
      this._restockProduct
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

  public get productRepository(): IProductRepository {
    return this._productRepository;
  }

  public get createProduct(): CreateProduct {
    return this._createProduct;
  }

  public get getProducts(): GetProducts {
    return this._getProducts;
  }

  public get getProductById(): GetProductById {
    return this._getProductById;
  }

  public get restockProduct(): RestockProduct {
    return this._restockProduct;
  }

  public get productController(): ProductController {
    return this._productController;
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