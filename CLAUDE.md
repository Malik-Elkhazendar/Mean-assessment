# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a MEAN stack assessment project built with Nx monorepo architecture. It consists of:

- **Backend (NestJS)**: Located in `apps/server/` - REST API with MongoDB, JWT authentication, product management, rate limiting, password reset functionality, and comprehensive logging
- **Frontend (Angular)**: Located in `apps/client/` - Standalone Angular application with routing and Material UI
- **Shared Libraries**: Located in `libs/shared/` - Reusable modules for constants, data models, DTOs, validation, UI components, utils, and logging

## Key Development Commands

### Build Commands
- `npx nx build server` - Build the NestJS backend
- `npx nx build client` - Build the Angular frontend
- `npx nx build server --configuration=development` - Development build for server

### Development Servers
- `npx nx serve server` - Start the NestJS development server (depends on build)
- `npx nx serve client` - Start the Angular development server

### Testing
- `npx nx test` - Run all tests across the monorepo
- `npx nx test server` - Run server-specific tests
- `npx nx test client` - Run client-specific tests
- Individual library tests: `npx nx test shared-constants`, `npx nx test shared-validation`, etc.

### Linting & Formatting
- `npx nx lint` - Lint all projects
- `npx nx lint server` - Lint server code
- `npx nx lint client` - Lint client code
- `prettier --write .` - Format all code (uses single quotes configuration)

### Nx Workspace Commands
- `npx nx graph` - View project dependency graph
- `npx nx show project server` - Show available targets for server
- `npx nx list` - List available plugins
- `npx nx g @nx/nest:app demo` - Generate new NestJS application
- `npx nx g @nx/node:lib mylib` - Generate new library

## Architecture Overview

### Backend Architecture (NestJS)
- **Entry Point**: `apps/server/src/main.ts` - Application bootstrap with global configuration
- **Core Module**: `apps/server/src/core/` - Global services for logging, error handling, interceptors
- **Database Module**: MongoDB connection via Mongoose with async configuration
- **User Module**: Example feature module in `apps/server/src/modules/users/`
- **Auth Module**: Complete authentication system in `apps/server/src/modules/auth/` with JWT, password reset, rate limiting
- **Product Module**: Full CRUD product management in `apps/server/src/modules/products/` with user-scoped access
- **Email Module**: SMTP email service in `apps/server/src/modules/email/` using MailerService and Handlebars
- **Configuration**: Environment-based config in `apps/server/src/config/` (app, auth, database, email, throttler, cors)
- **Exception Handling**: Hierarchical filters (Validation → MongoDB → HTTP → Global)
- **Logging**: Winston-based structured logging with correlation IDs

### Frontend Architecture (Angular)
- **Standalone Application**: Uses Angular's new standalone API
- **Routing**: Configured in `app.routes.ts`
- **Configuration**: Application config in `app.config.ts`
- **Testing**: Jest with Angular preset and custom setup

### Shared Libraries Structure
Each shared library follows consistent structure:
- `src/index.ts` - Main export file
- `src/lib/` - Implementation files
- Individual Jest, ESLint, and TypeScript configurations
- Exported via TypeScript path mapping in `tsconfig.base.json`

### Build System
- **Webpack**: Custom configuration for server builds in `apps/server/webpack.config.js`
- **Output**: Server builds to `dist/apps/server`, client builds to `dist/client`
- **Development**: Uses Nx's dev server with hot reload

### Code Quality Tools
- **ESLint**: Nx-configured with module boundary enforcement
- **Jest**: Different configurations for Node (server) and JSDOM (client) environments
- **Prettier**: Single quote configuration
- **TypeScript**: Strict configuration with path mapping for shared libraries

### Environment Configuration
- Server expects `.env.local` or `.env` files
- CORS configured for `http://localhost:4200` (Angular dev server)
- Global prefix and port configurable via environment variables
- Database URI and options configurable via environment
- Email SMTP settings for Mailtrap (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- Email templates located in `apps/server/templates/`
- Rate limiting configuration (RATE_LIMIT_TTL, RATE_LIMIT_MAX_REQUESTS, etc.)
- CORS origins configuration (CORS_ORIGINS, CORS_CREDENTIALS, CORS_MAX_AGE)

### Key Patterns
- **Modular Architecture**: Feature-based modules with controllers, services, schemas
- **Global Exception Handling**: Comprehensive error filtering with proper HTTP status codes
- **Structured Logging**: Winston with metadata and correlation tracking
- **Validation**: Class-validator with transform and whitelist options
- **Configuration Management**: Nested configuration objects with type safety

### Development Workflow
1. Start with `npx nx serve server` for backend
2. Start with `npx nx serve client` for frontend in separate terminal
3. Run tests with `npx nx test` before committing
4. Use `npx nx graph` to understand project dependencies
5. Follow existing patterns when adding new features or libraries

### MongoDB Integration
- Uses Mongoose with NestJS integration
- Async configuration pattern for database connection
- Connection URI and options from configuration service
- Schema-based models in feature modules

### Error Handling Strategy
- Validation errors for input validation
- MongoDB-specific error handling
- HTTP exception mapping
- Global fallback with structured error responses
- Process-level exception handling for graceful shutdown

## Authentication System

### Complete JWT Authentication
- **AuthModule**: `apps/server/src/modules/auth/auth.module.ts` - Full authentication module
- **JwtStrategy**: Passport-based token validation from Authorization headers
- **JwtAuthGuard**: Route protection guard with comprehensive error handling
- **AuthService**: Business logic for signup, signin, signout, forgot/reset password
- **AuthController**: REST endpoints for all authentication operations

### Password Reset System
- **Forgot Password Flow**: POST `/auth/forgot-password` - Generates reset token, sends email
- **Reset Password Flow**: POST `/auth/reset-password` - Validates token, updates password
- **Email Integration**: Uses @nestjs-modules/mailer with Handlebars templates
- **Security Features**: 1-hour token expiry, secure token validation, silent failures for security
- **Template**: Professional HTML email template in `apps/server/templates/forgot-password.hbs`

### Endpoints Summary
- `POST /auth/signup` - User registration with immediate JWT token
- `POST /auth/signin` - User authentication with 8-hour JWT token
- `POST /auth/signout` - Protected endpoint for logout audit logging  
- `POST /auth/profile` - Protected endpoint to get current user profile
- `POST /auth/forgot-password` - Send password reset email to user
- `POST /auth/reset-password` - Reset password using token from email

### Email System
- **EmailModule**: `apps/server/src/modules/email/email.module.ts` - SMTP configuration
- **EmailService**: Transactional email sending with Winston logging
- **Templates**: Handlebars templates in `apps/server/templates/`
- **SMTP Provider**: Configured for Mailtrap development/testing
- **Security**: Professional templates with security notices and expiry warnings

## Product Management System

### Complete CRUD Operations
- **ProductModule**: `apps/server/src/modules/products/product.module.ts` - Full product management
- **ProductSchema**: Mongoose schema with business logic validation and indexes
- **ProductService**: CRUD operations with user-scoped access control and search
- **ProductController**: RESTful endpoints following SOLID principles (no business logic)
- **User Ownership**: All products are scoped to the creating user for security

### Product Features
- **CRUD Operations**: Create, read, update, delete products with validation
- **Search & Filtering**: Text search by name/description, category filtering, stock filtering
- **Pagination**: Configurable page size with metadata (hasNext, hasPrev, totalPages)
- **Statistics**: User dashboard with total products, stock status, inventory value
- **Business Logic**: Auto-stock management, price precision, inventory tracking

### Product Endpoints Summary
- `GET /products` - List user's products with pagination, search, filtering
- `POST /products` - Create new product (protected, user-scoped)
- `GET /products/stats` - Get user's product statistics and analytics
- `GET /products/:id` - Get single product by ID (user-scoped access)
- `PUT /products/:id` - Update product (user-scoped, owner validation)
- `DELETE /products/:id` - Delete product (user-scoped, owner validation)

### Security & Access Control
- **Authentication Required**: All endpoints protected with JwtAuthGuard
- **User-Scoped Data**: Users can only access their own products
- **Ownership Validation**: Update/delete operations validate user ownership
- **Input Validation**: Comprehensive DTOs with business rule validation

## Security Features

### Rate Limiting System
- **Global Rate Limiting**: 100 requests per minute default across all endpoints
- **Authentication Endpoints**: Stricter limits for sensitive operations
  - Sign up: 3 attempts per 15 minutes
  - Sign in: 5 attempts per 15 minutes  
  - Forgot password: 3 requests per hour
  - Reset password: 5 attempts per hour
- **Configurable Limits**: Environment-based rate limit configuration
- **IP-Based Protection**: Prevents abuse from individual sources

### Enhanced CORS Configuration
- **Dynamic Origins**: Environment-based allowed origins list
- **Development Mode**: Automatic localhost and local IP allowance
- **Production Security**: Strict origin validation in production
- **Credential Handling**: Configurable credential support
- **Header Management**: Comprehensive allowed/exposed headers

### Environment Variables for Security
```
# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_TTL=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# CORS
CORS_ORIGINS=http://localhost:4200,https://myapp.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```