# Product Feature Implementation Plan

## 🎯 **Business Domain Analysis**

### **Product Types in Salon CRM**
1. **Services** - Haircut, Coloring, Styling, Manicure, Pedicure, etc.
2. **Physical Products** - Shampoo, Conditioner, Hair Accessories, etc.
3. **Packages** - Service bundles with discounts

### **Core Business Rules**
1. **Pricing**: All products must have a valid price > 0
2. **Categories**: Products belong to predefined categories
3. **Services**: Have duration (15-300 minutes)
4. **Physical Products**: Have inventory tracking (stock levels)
5. **Status**: Active/Inactive for availability
6. **SKU**: Unique identifier for inventory management

---

## 🏗️ **1. DOMAIN LAYER**

### **Product Entity** (`src/domain/entities/Product.ts`)
```typescript
export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Price;
  category: ProductCategory;
  type: ProductType;
  sku: SKU;
  isActive: boolean;
  // Service-specific
  durationMinutes?: number;
  // Physical Product-specific  
  stockLevel?: number;
  lowStockThreshold?: number;
  // Common metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<string> {
  // Business methods
  updatePrice(newPrice: Price): void
  markAsOutOfStock(): void
  restockItem(quantity: number): void
  deactivate(): void
  reactivate(): void
  
  // Business queries
  isOutOfStock(): boolean
  isLowStock(): boolean
  isService(): boolean
  isPhysicalProduct(): boolean
  getDiscountedPrice(discountPercent: number): Price
}
```

### **Value Objects**
1. **Price** (`src/domain/value-objects/Price.ts`)
   - Validation: Must be > 0, max 2 decimal places
   - Currency formatting
   - Discount calculations

2. **ProductCategory** (`src/domain/value-objects/ProductCategory.ts`)
   - Predefined categories: "HAIR_SERVICES", "NAIL_SERVICES", "HAIR_PRODUCTS", etc.
   - Validation against allowed values

3. **ProductType** (`src/domain/value-objects/ProductType.ts`)
   - Values: "SERVICE", "PHYSICAL_PRODUCT", "PACKAGE"
   - Business logic based on type

4. **SKU** (`src/domain/value-objects/SKU.ts`)
   - Format: Category prefix + sequential number (e.g., "HS-001", "HP-001")
   - Uniqueness validation

### **Repository Interface** (`src/domain/repositories/IProductRepository.ts`)
```typescript
export interface IProductRepository extends IRepository<Product, string> {
  findBySku(sku: SKU): Promise<Product | null>;
  findByCategory(category: ProductCategory, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findByType(type: ProductType, options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findActiveProducts(options?: FindAllOptions): Promise<PaginatedResult<Product>>;
  findLowStockProducts(): Promise<Product[]>;
  findServicesInPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
}
```

---

## 🎯 **2. APPLICATION LAYER**

### **DTOs** (`src/application/dtos/ProductDto.ts`)
```typescript
export interface CreateProductRequestDto {
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  durationMinutes?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  sku: string;
  isActive: boolean;
  durationMinutes?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Use Cases**
1. **CreateProduct** - Validate business rules, generate SKU
2. **GetProducts** - List with filtering by category, type, status
3. **GetProductById** - Single product retrieval
4. **UpdateProduct** - Price changes, stock updates
5. **DeactivateProduct** - Soft delete for discontinued items
6. **RestockProduct** - Inventory management
7. **GetLowStockReport** - Business intelligence

---

## 🏗️ **3. INFRASTRUCTURE LAYER**

### **Database Schema** (Prisma)
```prisma
model Product {
  id                  String   @id @default(uuid())
  name                String
  description         String
  price               Decimal  @db.Decimal(10,2)
  category            String
  type                String
  sku                 String   @unique
  isActive            Boolean  @default(true)
  durationMinutes     Int?
  stockLevel          Int?
  lowStockThreshold   Int?
  metadata            Json?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([category])
  @@index([type])
  @@index([sku])
  @@index([isActive])
  @@map("products")
}
```

### **Repository Implementation** (`src/infrastructure/database/repositories/ProductRepository.ts`)
- Implement all IProductRepository methods
- Handle Prisma Decimal type conversions
- Complex queries for business intelligence

### **Mapper** (`src/infrastructure/database/mappers/ProductMapper.ts`)
- Convert between Prisma models and Domain entities
- Handle Price value object mapping
- Manage optional fields based on product type

### **Web Layer**
- **Controller**: Handle HTTP requests, delegate to use cases
- **Routes**: RESTful endpoints with validation
- **Schemas**: Zod validation schemas for requests

---

## 📊 **4. API ENDPOINTS DESIGN**

```bash
# Product CRUD
POST   /api/products              # Create product
GET    /api/products              # List products (with filters)
GET    /api/products/:id          # Get product by ID
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Deactivate product

# Business Operations
PUT    /api/products/:id/restock  # Restock inventory
GET    /api/products/low-stock    # Low stock report
GET    /api/products/categories   # Get available categories

# Advanced Queries
GET    /api/products?category=HAIR_SERVICES
GET    /api/products?type=SERVICE
GET    /api/products?active=true
GET    /api/products?priceMin=50&priceMax=200
```

---

## 🧪 **5. TESTING STRATEGY**

### **Business Logic Tests**
1. **Price Validation**: Negative prices, decimal precision
2. **Category Validation**: Invalid categories rejected
3. **Service Duration**: Only services can have duration
4. **Stock Management**: Only physical products track inventory
5. **SKU Generation**: Unique, format validation

### **CRUD Tests via Curl**
1. Create Hair Service (duration-based)
2. Create Hair Product (inventory-based)  
3. Create Package (combination)
4. Search by category
5. Low stock alerts
6. Price range filtering
7. Deactivation workflow

---

## 🚀 **6. IMPLEMENTATION ORDER**

### **Phase 1: Domain Foundation**
1. Price value object
2. ProductCategory value object  
3. ProductType value object
4. SKU value object
5. Product entity
6. IProductRepository interface

### **Phase 2: Application Layer**
1. Product DTOs
2. CreateProduct use case
3. GetProducts use case
4. GetProductById use case

### **Phase 3: Infrastructure**
1. Prisma schema update
2. ProductMapper
3. ProductRepository
4. ProductController
5. Product routes
6. Update DI container

### **Phase 4: Testing**
1. Domain unit tests
2. API integration tests
3. Business scenario tests

---

## 💼 **Business Value**

### **Immediate Benefits**
- ✅ Complete product catalog management
- ✅ Service duration tracking for scheduling
- ✅ Inventory management for physical products
- ✅ Category-based organization
- ✅ Business intelligence (low stock alerts)

### **Future Integration**
- 🔗 **Menu/Catalog**: Group products into service menus
- 🔗 **Sales Reports**: Track product performance
- 🔗 **Scheduling**: Use service durations for appointments
- 🔗 **WhatsApp Bot**: Show available products/services

---

## 📈 **Success Metrics**

1. **Create 3 product types** (Service, Physical, Package)
2. **Search/filter functionality** working
3. **Stock management** for physical products
4. **Business rules validation** (price, category, etc.)
5. **Performance**: Sub-100ms response times
6. **Error handling**: Proper validation messages

This plan builds on our Customer success and establishes the foundation for Menu/Catalog and Sales features! 🚀 