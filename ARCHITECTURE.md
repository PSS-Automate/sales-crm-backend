# Salon CRM Backend - Clean Architecture Documentation

## 🏗️ Architecture Overview

This salon CRM backend follows **Clean Architecture** principles with **Domain-Driven Design (DDD)** patterns, implemented in **TypeScript**. The architecture ensures maintainable, testable, and scalable code that clearly expresses salon business domain logic.

## 📁 Project Structure

```
src/
├── shared/                          # Shared Kernel
│   ├── base-classes/               # Abstract base classes
│   │   ├── Entity.ts               # Base entity class
│   │   ├── ValueObject.ts          # Base value object class
│   │   └── UseCase.ts              # Base use case class
│   ├── errors/                     # Domain error types
│   │   └── DomainError.ts          # Structured error hierarchy
│   └── interfaces/                 # Common interfaces
│       └── IRepository.ts          # Base repository contract
│
├── domain/                         # Enterprise Business Rules
│   ├── entities/                   # Core business objects
│   │   └── Customer.ts             # Customer entity with business logic
│   ├── value-objects/              # Immutable descriptive objects
│   │   ├── Email.ts                # Email validation and formatting
│   │   ├── Phone.ts                # Phone validation and formatting
│   │   └── LoyaltyPoints.ts        # Loyalty business rules
│   └── repositories/               # Data access contracts
│       └── ICustomerRepository.ts  # Customer persistence interface
│
├── application/                    # Application Business Rules  
│   ├── dtos/                       # Data Transfer Objects
│   │   └── CustomerDto.ts          # API request/response contracts
│   └── use-cases/                  # Application orchestration
│       └── customer/               # Customer operations
│           ├── CreateCustomer.ts   # Customer creation workflow
│           ├── GetCustomers.ts     # Customer list with search
│           └── GetCustomerById.ts  # Single customer retrieval
│
└── infrastructure/                 # Frameworks & Drivers (TBD)
    ├── database/                   # Data persistence
    └── web/                        # HTTP interface
```

## 🧩 Architecture Layers Explained

### 1. **Shared Kernel** (`src/shared/`)

**Purpose**: Common utilities and abstractions used across all layers.

**Key Components**:
- **Entity**: Base class for objects with identity and lifecycle
- **ValueObject**: Base class for immutable descriptive objects  
- **UseCase**: Base class for application operations
- **Errors**: Structured error hierarchy for better debugging
- **IRepository**: Generic interface for data access patterns

**Example**:
```typescript
// All entities extend this base class
export abstract class Entity<T> {
  protected readonly _id: T;
  protected _updatedAt: Date;
  
  public get id(): T { return this._id; }
  protected touch(): void { this._updatedAt = new Date(); }
  public abstract toJSON(): Record<string, any>;
}
```

### 2. **Domain Layer** (`src/domain/`)

**Purpose**: Core business logic and rules - the heart of the application.

**Key Principles**:
- ✅ **No external dependencies** - Pure business logic
- ✅ **Rich behavior** - Entities know how to operate on themselves
- ✅ **Immutable value objects** - Validated, descriptive objects
- ✅ **Interface contracts** - Repository interfaces without implementation

**Real Business Examples**:

```typescript
// Value Object with business validation
const loyaltyPoints = LoyaltyPoints.create(1500);
loyaltyPoints.getTierLevel(); // "Gold"
loyaltyPoints.getDiscountPercentage(); // 0.10

// Entity with business behavior
customer.addLoyaltyPoints(100);
customer.recordVisit();
customer.isVipCustomer(); // true (>10 visits OR >1000 points)
customer.getDaysSinceLastVisit(); // 5
```

**Domain Services**: Complex business logic that doesn't belong in a single entity.

### 3. **Application Layer** (`src/application/`)

**Purpose**: Orchestrates domain objects to fulfill application use cases.

**Key Principles**:
- ✅ **Thin layer** - No business logic, only orchestration
- ✅ **Use case focused** - One class per operation
- ✅ **DTO contracts** - Clean API interfaces
- ✅ **Error translation** - Domain errors to application responses

**Example Flow**:
```typescript
export class CreateCustomer extends UseCase<CreateCustomerDto, CustomerResponseDto> {
  async execute(request: CreateCustomerDto): Promise<CustomerResponseDto> {
    // 1. Create domain objects (validation happens here)
    const email = Email.create(request.email);
    const phone = Phone.create(request.phone);
    
    // 2. Check business rules
    await this.checkForDuplicates(email, phone);
    
    // 3. Create entity
    const customer = Customer.create({ name: request.name, email, phone });
    
    // 4. Persist via repository interface
    const savedCustomer = await this.customerRepository.create(customer);
    
    // 5. Return DTO (never expose domain objects directly)
    return this.mapToResponseDto(savedCustomer);
  }
}
```

### 4. **Infrastructure Layer** (To Be Implemented)

**Purpose**: External frameworks, databases, web servers, etc.

**Will include**:
- **Prisma repositories** - Implementation of domain repository interfaces
- **Fastify controllers** - HTTP request/response handling
- **Database mappers** - Convert between domain objects and database models
- **Middleware** - Authentication, validation, error handling

## 🎯 Business Domain Modeling

### **Customer Domain**

Our Customer entity models real salon business:

```typescript
// Rich business behavior
customer.addLoyaltyPoints(150);        // Earned from $150 service
customer.recordVisit();                // Track visit history
customer.getLoyaltyTier();             // "Gold" 
customer.getDiscountPercentage();      // 10% discount for Gold tier
customer.isVipCustomer();              // true (meets VIP criteria)
customer.redeemLoyaltyPoints(500);     // Use points for discount
```

**Business Rules Implemented**:
- ✅ **Loyalty Tiers**: Bronze (0-499), Silver (500-999), Gold (1000-1999), Platinum (2000+)
- ✅ **VIP Status**: 10+ visits OR 1000+ loyalty points
- ✅ **Discount System**: Bronze 0%, Silver 5%, Gold 10%, Platinum 15%
- ✅ **Points System**: 1 point per dollar spent

### **Value Objects**

**Email**: 
- Validates format, handles common typos
- Provides domain (gmail.com) and local part (user) extraction
- Salon-specific validation rules

**Phone**:
- Supports international formats
- Provides clean (digits only) and formatted display
- Flexible input, standardized storage

**LoyaltyPoints**:
- Encapsulates all loyalty business logic
- Prevents negative points, validates operations
- Calculates tiers and discounts automatically

## 🔄 Data Flow Example

### Creating a Customer:

```
1. HTTP Request → CustomerController
   POST /api/customers { name: "John", email: "john@email.com", phone: "+1234567890" }

2. Controller → CreateCustomer Use Case
   CreateCustomerDto { name, email, phone }

3. Use Case → Domain Objects
   email = Email.create("john@email.com")     // Validates format
   phone = Phone.create("+1234567890")        // Validates format
   customer = Customer.create({ name, email, phone })

4. Use Case → Repository Interface
   await customerRepository.create(customer)

5. Repository → Database (Prisma)
   INSERT INTO customers (id, name, email, phone, loyalty_points, ...)

6. Response Chain
   Customer Entity → CustomerResponseDto → HTTP Response
```

**Key Benefits**:
- ✅ **Validation** happens in domain layer (Email, Phone value objects)
- ✅ **Business rules** applied in entity (Customer.create())
- ✅ **Persistence** abstracted through interface
- ✅ **Clean data contracts** via DTOs

## 🧪 Testing Strategy

### **Domain Layer** (Pure Unit Tests):
```typescript
describe('Customer', () => {
  it('should calculate VIP status correctly', () => {
    const customer = Customer.create({
      name: 'John',
      email: Email.create('john@email.com'),
      phone: Phone.create('+1234567890'),
      loyaltyPoints: LoyaltyPoints.create(1200),
      totalVisits: 5
    });
    
    expect(customer.isVipCustomer()).toBe(true); // >1000 points
  });
});
```

### **Application Layer** (Mock Repositories):
```typescript
describe('CreateCustomer', () => {
  it('should create customer successfully', async () => {
    const mockRepository = {
      create: jest.fn().mockResolvedValue(mockCustomer),
      findByEmail: jest.fn().mockResolvedValue(null)
    };
    
    const useCase = new CreateCustomer(mockRepository);
    const result = await useCase.execute({ name: 'John', email: 'john@email.com' });
    
    expect(result.name).toBe('John');
  });
});
```

### **Infrastructure Layer** (Integration Tests):
```typescript
describe('CustomerRepository', () => {
  it('should persist customer to database', async () => {
    // Test with real Prisma and test database
  });
});
```

## 🚀 Benefits Achieved

### **1. Maintainability**
- ✅ **Clear separation** - Business logic isolated from frameworks
- ✅ **Single responsibility** - Each class has one clear purpose
- ✅ **Type safety** - Compile-time error catching

### **2. Testability**
- ✅ **Pure domain logic** - No external dependencies to mock
- ✅ **Interface contracts** - Easy to mock repositories
- ✅ **Predictable behavior** - Domain objects are deterministic

### **3. Scalability**
- ✅ **Template patterns** - Easy to add new features (Product, Client, etc.)
- ✅ **Dependency inversion** - Can swap implementations without changing business logic
- ✅ **Clear contracts** - Teams can work independently on different layers

### **4. Business Clarity**
- ✅ **Expressive code** - `customer.isVipCustomer()` reads like business language
- ✅ **Centralized rules** - All loyalty logic in LoyaltyPoints value object
- ✅ **Rich domain model** - Entities know how to behave

## 🎯 Next Steps

### **Phase A: Complete Infrastructure**
1. **Prisma Repositories** - Implement ICustomerRepository
2. **Web Controllers** - HTTP layer for Customer operations
3. **Dependency Injection** - Wire everything together
4. **Integration Testing** - End-to-end validation

### **Remaining Features** (use templates):
1. **Product Management** - Inventory, pricing, categories
2. **Client (Staff) Management** - Specialties, scheduling, ratings  
3. **Menu/Catalog** - Services offered, duration, pricing
4. **Daily Sales Reports** - Analytics, metrics, trends

Each feature follows the same pattern:
- Domain Entity with business logic
- Repository interface for data access
- Use cases for operations
- DTOs for API contracts

**Estimated time**: 2-3 hours per feature using established patterns.

## 💡 Key Success Factors

1. **Business Logic First** - Always start with domain modeling
2. **Interfaces Over Implementation** - Program to contracts
3. **Value Objects for Validation** - Let domain objects validate themselves
4. **Thin Application Layer** - Keep use cases focused on orchestration
5. **Rich Domain Model** - Entities should know how to behave
6. **Type Safety** - Let TypeScript catch errors early

This architecture ensures your salon CRM will be maintainable, testable, and ready to scale as your business grows! 🚀 