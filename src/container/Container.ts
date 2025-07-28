import { PrismaClient } from '@prisma/client';

// Infrastructure
import { CustomerRepository } from '../infrastructure/database/repositories/CustomerRepository';
import { CustomerController } from '../infrastructure/web/controllers/CustomerController';
import { ProductRepository } from '../infrastructure/database/repositories/ProductRepository';
import { ProductController } from '../infrastructure/web/controllers/ProductController';
import { ClientRepository } from '../infrastructure/database/repositories/ClientRepository';
import { ClientController } from '../infrastructure/web/controllers/ClientController';
import { MenuItemRepository } from '../infrastructure/database/repositories/MenuItemRepository';
import { MenuItemController } from '../infrastructure/web/controllers/MenuItemController';

// Application Use Cases
import { CreateCustomer } from '../application/use-cases/customer/CreateCustomer';
import { GetCustomers } from '../application/use-cases/customer/GetCustomers';
import { GetCustomerById } from '../application/use-cases/customer/GetCustomerById';
import { CreateProduct } from '../application/use-cases/product/CreateProduct';
import { GetProducts } from '../application/use-cases/product/GetProducts';
import { GetProductById } from '../application/use-cases/product/GetProductById';
import { RestockProduct } from '../application/use-cases/product/RestockProduct';
import { CreateClient } from '../application/use-cases/client/CreateClient';
import { GetClients } from '../application/use-cases/client/GetClients';
import { GetClientById } from '../application/use-cases/client/GetClientById';
import { CreateMenuItem } from '../application/use-cases/menu/CreateMenuItem';
import { GetMenuItems } from '../application/use-cases/menu/GetMenuItems';
import { GetMenuItemById } from '../application/use-cases/menu/GetMenuItemById';

// Domain Interfaces
import { ICustomerRepository } from '../domain/repositories/ICustomerRepository';
import { IProductRepository } from '../domain/repositories/IProductRepository';
import { IClientRepository } from '../domain/repositories/IClientRepository';
import { IMenuItemRepository } from '../domain/repositories/IMenuItemRepository';

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
  private _clientRepository: IClientRepository;
  private _createClient: CreateClient;
  private _getClients: GetClients;
  private _getClientById: GetClientById;
  private _clientController: ClientController;
  private _menuItemRepository: IMenuItemRepository;
  private _createMenuItem: CreateMenuItem;
  private _getMenuItems: GetMenuItems;
  private _getMenuItemById: GetMenuItemById;
  private _menuItemController: MenuItemController;

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

    // Client Dependencies
    // Infrastructure Layer - Repository
    this._clientRepository = new ClientRepository() as any;

    // Application Layer - Use Cases
    this._createClient = new CreateClient(this._clientRepository);
    this._getClients = new GetClients(this._clientRepository);
    this._getClientById = new GetClientById(this._clientRepository);

    // Infrastructure Layer - Controller
    this._clientController = new ClientController(
      this._createClient,
      this._getClients,
      this._getClientById
    );

    // MenuItem Dependencies
    // Infrastructure Layer - Repository
    this._menuItemRepository = new MenuItemRepository();

    // Application Layer - Use Cases
    this._createMenuItem = new CreateMenuItem(this._menuItemRepository);
    this._getMenuItems = new GetMenuItems(this._menuItemRepository);
    this._getMenuItemById = new GetMenuItemById(this._menuItemRepository);

    // Infrastructure Layer - Controller
    this._menuItemController = new MenuItemController(
      this._createMenuItem,
      this._getMenuItems,
      this._getMenuItemById
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

  public get clientRepository(): IClientRepository {
    return this._clientRepository;
  }

  public get createClient(): CreateClient {
    return this._createClient;
  }

  public get getClients(): GetClients {
    return this._getClients;
  }

  public get getClientById(): GetClientById {
    return this._getClientById;
  }

  public get clientController(): ClientController {
    return this._clientController;
  }

  public get menuItemRepository(): IMenuItemRepository {
    return this._menuItemRepository;
  }

  public get createMenuItem(): CreateMenuItem {
    return this._createMenuItem;
  }

  public get getMenuItems(): GetMenuItems {
    return this._getMenuItems;
  }

  public get getMenuItemById(): GetMenuItemById {
    return this._getMenuItemById;
  }

  public get menuItemController(): MenuItemController {
    return this._menuItemController;
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