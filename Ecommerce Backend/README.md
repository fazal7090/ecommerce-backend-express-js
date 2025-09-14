# Ecommerce Backend API

A comprehensive Node.js backend API for an ecommerce platform built with Express.js, Prisma ORM, and PostgreSQL. This API supports multi-role authentication (users, sellers, admins) and provides complete ecommerce functionality including product management, store operations, and order processing.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication System** - Support for users, sellers, and admins
- **Store Management** - Sellers can create and manage their stores
- **Product Management** - Complete CRUD operations for products
- **Category System** - Organized product categorization
- **Image Upload** - Cloudinary integration for product images
- **Order Management** - Order creation and tracking
- **Admin Panel** - Administrative functions for platform management

### Technical Features
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Express-validator for request validation
- **Error Handling** - Comprehensive error middleware
- **Logging** - Winston logger with multiple transports
- **Database ORM** - Prisma for type-safe database operations
- **File Upload** - Multer middleware for image handling
- **Environment Configuration** - Secure environment variable management

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL
- **ORM**: Prisma 6.12.0
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Validation**: Express-validator
- **Logging**: Winston
- **Password Hashing**: bcrypt

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Cloudinary account (for image storage)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/fazal7090/ecommerce-backend-express-js.git>
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Media Provider
   MEDIA_PROVIDER="cloudinary"
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Schema

The application uses the following main entities:

- **User** - Platform users (customers, sellers, admins)
- **Store** - Seller stores
- **Product** - Store products
- **Category** - Product categories
- **Order** - Customer orders
- **OrderItem** - Individual order items

### Key Relationships
- Users can have one Store (sellers only)
- Stores have many Products
- Products belong to Categories
- Orders contain multiple OrderItems
- OrderItems reference Products

## 🚦 API Endpoints

### Authentication Routes (`/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration | No |
| POST | `/login` | User login | No |

### Seller Routes (`/seller`)

#### Store Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-store` | Create a new store | Yes |

#### Product Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add-product` | Add product to store | Yes |
| PUT | `/update-product/:id` | Update product price/stock | Yes |
| DELETE | `/delete-product/:id` | Delete product | Yes |
| GET | `/get-product/:id` | Get single product | No |
| GET | `/get-all-products/:storeid` | Get all store products | No |
| GET | `/get-products-by-category/:storeid/:categoryid` | Get products by category | No |
| GET | `/get-products/:storeid` | Get product statistics | No |
| GET | `/get-all-categories` | Get all categories | No |

### Admin Routes (`/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/seller/all-sellers` | Get all sellers | Yes (Admin) |
| GET | `/seller/product/:storeid` | Get seller's products | Yes (Admin) |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **user**: Regular customers
- **seller**: Store owners
- **admin**: Platform administrators

## 📁 Project Structure

```
src/
├── config/
│   └── morganMiddleware.js      # HTTP request logging
├── controllers/
│   ├── admin controller/
│   │   └── admin-seller-controller.js
│   ├── seller controller/
│   │   ├── seller-order-controller.js
│   │   └── seller-product-controller.js
│   └── user_controller/
│       └── login/
│           └── user-authentication.js
├── lib/
│   ├── cloudinary.js            # Cloudinary configuration
│   ├── logger.js                # Winston logger setup
│   └── uploadToCloudinary.js    # Image upload utilities
├── middleware/
│   ├── authmiddleware.js        # JWT authentication
│   ├── error-middleware.js      # Error handling
│   ├── upload-middleware.js     # File upload handling
│   └── user-middleware.js       # User-specific middleware
├── routes/
│   ├── admin-routes/
│   ├── seller-routes/
│   └── user-routes/
├── storage/
│   ├── adapter/
│   │   └── cloudinaryStorage.js # Storage adapter
│   ├── index.js                 # Storage configuration
│   └── media-storage.js         # Media storage utilities
├── utils/
│   └── AppError.js              # Custom error class
└── index.js                     # Application entry point
```

## 🖼️ Image Upload

The application supports image uploads for products using Cloudinary:

1. **Upload Format**: Form-data with `imageUrl` field
2. **Supported Formats**: Common image formats (JPEG, PNG, etc.)
3. **Storage**: Images are stored in Cloudinary with automatic URL generation
4. **Cleanup**: Images are automatically deleted when products are removed

### Example Upload Request
```bash
curl -X POST http://localhost:3000/seller/add-product \
  -H "Authorization: Bearer <token>" \
  -F "name=Product Name" \
  -F "description=Product Description" \
  -F "price=29.99" \
  -F "stock=100" \
  -F "categoryid=1" \
  -F "storeid=1" \
  -F "imageUrl=@/path/to/image.jpg"
```

## 📝 Logging

The application uses Winston for comprehensive logging:

- **Console Output**: Colored logs for development
- **File Logging**: 
  - `logs/all.log` - All log levels
  - `logs/error.log` - Error logs only
- **Log Levels**: error, warn, info, http, debug
- **Environment-based**: More verbose logging in development

## 🚨 Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Input validation with express-validator
- **Custom Errors**: AppError class for consistent error responses
- **HTTP Status Codes**: Proper status codes for different scenarios
- **Error Logging**: All errors are logged for debugging

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Environment Variables**: Sensitive data in environment variables

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure Cloudinary production settings
5. Set up proper logging
6. Configure reverse proxy (nginx)
7. Set up SSL certificates

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-production-secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
PORT=3000
```

## 🧪 Testing

The API can be tested using tools like:
- **Postman**: For API endpoint testing
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

### Sample Test Requests

**User Registration:**
```bash
curl -X POST http://localhost:3000/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "contact": "+1234567890",
    "address": "123 Main St"
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📈 Performance Considerations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: Implemented for product listings
- **Image Optimization**: Cloudinary handles image optimization
- **Connection Pooling**: Prisma manages database connections
- **Logging Levels**: Configurable logging for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


For support and questions:
- Create an issue in the repository
- Check the logs in `logs/` directory
- Review the API documentation above


**Note**: This is a backend API. You'll need a frontend application to interact with these endpoints for a complete ecommerce solution.
