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
- **Standalone Application**: Uses Angular 18+ with modern standalone components and signals
- **Professional UI/UX Design**: Custom soft-color theme with professional aesthetics suitable for technical assessments
- **Separation of Concerns**: ALL components use separate .html, .scss, and .ts files (NO inline templates/styles)
- **Material Design**: Angular Material with custom theme and responsive layout system
- **State Management**: NgRx with authentication slice, effects for async operations, and store persistence
- **Authentication**: Complete JWT-based auth system with token persistence and route guards
- **Routing**: Feature-based lazy loading with authentication guards and proper route structure
- **HTTP Client**: Interceptors for JWT token attachment, error handling, and API integration
- **Configuration**: Environment-based configuration with HTTP interceptors and error handling
- **UI Components**: Shared component library with reusable, accessible Material Design components
- **Forms**: Reactive forms with validation matching backend DTOs and user-friendly error display
- **Testing**: Jest with Angular testing utilities, NgRx testing utilities, and Material component harnesses
- **Development**: Hot reload, Redux DevTools integration, proxy configuration for backend API

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
1. Start with `npx nx serve server` for backend API (http://localhost:3000)
2. Start with `npx nx serve client` for frontend (http://localhost:4200) - includes proxy to backend
3. Both services support hot reload and automatic restart on code changes
4. Run tests with `npx nx test` before committing (supports specific project testing)
5. Use `npx nx graph` to visualize project dependencies and shared library relationships
6. Follow established patterns: **STRICT file separation** (no inline templates/styles), modular architecture, reactive forms, OnPush change detection
7. **UI/UX Standards**: Use professional design patterns, soft colors, no placeholders, contextual content
8. Leverage shared libraries for consistency across frontend and backend

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

## Frontend Application Structure

### Angular Client Architecture
The Angular application follows a feature-based modular architecture with shared components and services:

```
apps/client/src/
├── app/
│   ├── core/                     # Singleton services, guards, interceptors
│   │   ├── guards/               # Authentication and route guards
│   │   ├── interceptors/         # HTTP interceptors (auth, error, loading)
│   │   ├── services/             # Core application services
│   │   └── core.module.ts        # Core module imports
│   ├── shared/                   # Shared modules and utilities
│   │   ├── components/           # App-specific shared components
│   │   ├── directives/           # Custom directives
│   │   ├── pipes/                # Custom pipes
│   │   └── shared.module.ts      # Shared module exports
│   ├── features/                 # Feature modules (lazy loaded)
│   │   ├── auth/                 # Authentication module
│   │   ├── dashboard/            # Main dashboard module
│   │   ├── products/             # Product management module
│   │   └── profile/              # User profile module
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # Application configuration
│   └── app.routes.ts             # Main routing configuration
├── environments/                 # Environment-specific configurations
├── styles/                       # Global styles and Material theming
└── assets/                       # Static assets
```

### Routing Structure
- **Public Routes**: Landing page, about, error pages
- **Authentication Routes**: Sign in, sign up, forgot password, reset password
- **Protected Routes**: Dashboard, products, profile (require authentication)
- **Admin Routes**: User management, system statistics (require admin role)

### Material Design Integration
- **Custom Theme**: Professional color palette with primary/accent/warn colors
- **Typography**: Configured typography scales for headings, body text, and UI elements
- **Responsive Layout**: Mobile-first design with Angular Flex Layout
- **Accessibility**: Full ARIA support and keyboard navigation

### Shared UI Components Library
Located in `libs/shared/ui/src/lib/components/`:

1. **Spinner**: Loading indicators with configurable size and color
2. **Alert**: Notification messages with variants (success, error, warning, info)
3. **FormInput**: Reusable form input with validation display
4. **Button**: Consistent button component with Material variants
5. **Card**: Content containers with header/body/footer sections
6. **Header**: Application navigation with responsive design

### State Management Preparation
- **Reactive Patterns**: RxJS throughout for asynchronous operations
- **NgRx Ready**: Architecture prepared for state management integration
- **OnPush Strategy**: Change detection optimization for performance
- **Signal Integration**: Modern Angular signals for reactive state

### API Integration
- **HTTP Client**: Configured with interceptors for authentication and error handling
- **Environment Configuration**: API endpoints and feature flags
- **Error Handling**: Consistent error handling with user-friendly messages
- **Loading States**: Global loading indicators and component-level spinners

### Development Tools
- **Hot Reload**: Automatic browser refresh on code changes
- **Proxy Configuration**: Seamless backend API integration during development
- **Source Maps**: Full debugging support in development mode
- **Build Optimization**: Production builds with tree shaking and minification

## Frontend Authentication & State Management System

### NgRx State Management Architecture
- **Auth Store**: Centralized authentication state with user, token, loading, and error properties
- **Auth Actions**: Type-safe actions for login, signup, logout, token refresh, and error handling
- **Auth Effects**: Async side effects for API calls, token persistence, and navigation
- **Auth Selectors**: Memoized selectors for isAuthenticated, user data, and loading states
- **Store Persistence**: JWT tokens persisted to localStorage with automatic rehydration
- **DevTools Integration**: Redux DevTools with maxAge 25, logOnly in production

### Authentication Components & Routes
**Public Routes:**
- `''` → **HomeComponent**: Landing page with application overview and auth CTAs
- `'auth/login'` → **LoginComponent**: User authentication with reactive forms
- `'auth/signup'` → **SignupComponent**: User registration with validation

**Protected Routes (AuthGuard):**
- `'dashboard'` → **DashboardComponent**: User dashboard with personalized content

### Authentication Services & Infrastructure
**Core Services:**
- **AuthService**: Login, signup, logout, token management, and user session handling
- **AuthInterceptor**: HTTP interceptor for automatic JWT token attachment and 401 error handling  
- **AuthGuard**: Route guard protecting authenticated routes and redirecting to login
- **Token Management**: Secure storage, validation, expiration checking, and automatic refresh

### State Structure & Management
```typescript
interface AuthState {
  user: User | null;           // Current authenticated user
  token: string | null;        // JWT access token
  loading: boolean;            // Loading state for auth operations  
  error: string | null;        // Authentication errors
  isAuthenticated: boolean;    // Computed authentication status
}
```

### Form Validation & User Experience
- **Reactive Forms**: Client-side validation matching backend DTOs (LoginDto, SignupDto)
- **Error Handling**: User-friendly error messages using shared AlertComponent
- **Loading States**: Spinner components during authentication operations
- **Success Feedback**: Confirmation messages for successful operations
- **Accessibility**: Proper focus management and screen reader support

### Token Security & Session Management
- **JWT Storage**: Tokens stored in localStorage using environment.auth.tokenKey
- **Expiration Handling**: 8-hour token validity with automatic expiry detection
- **Session Restoration**: Check stored tokens and restore user session on app initialization
- **Automatic Logout**: Handle token expiry with graceful logout and navigation
- **Security**: Tokens cleared on logout and browser session end

### API Integration with Backend
- **Endpoint Integration**: Uses shared API_ROUTES constants for consistent endpoint management
- **Type Safety**: Leverages shared interfaces (User, AuthResponse, LoginDto, SignupDto)
- **Error Messages**: Uses shared ERROR_MESSAGES constants for consistent user feedback
- **HTTP Status**: Proper handling of HTTP status codes using shared HTTP_STATUS constants

### Development Workflow for Authentication
1. **Authentication Flow Testing**: Use Redux DevTools to monitor auth state changes
2. **Token Testing**: Manually expire tokens to test refresh/logout logic
3. **Route Protection**: Test navigation between protected/public routes
4. **Form Validation**: Verify client-side validation matches backend requirements
5. **Error Scenarios**: Test network errors, invalid credentials, and server errors

## Angular Component File Separation Standards

### Strict File Separation Requirements (MANDATORY)
**CRITICAL**: Every Angular component MUST follow strict separation of concerns for technical assessment compliance:

#### File Structure Requirements
```
feature-folder/
├── component-name/
│   ├── component-name.component.ts     # Logic only - NO inline templates/styles
│   ├── component-name.component.html   # Template markup only
│   └── component-name.component.scss   # Component-specific styles only
```

#### Component Decorator Standards
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [...],
  templateUrl: './component-name.component.html',  // REQUIRED - no 'template'
  styleUrls: ['./component-name.component.scss']   // REQUIRED - no 'styles'
})
```

#### Forbidden Patterns
- ❌ `template: \`...\`` (inline templates)
- ❌ `styles: [\`...\`]` (inline styles)
- ❌ Components without dedicated folders
- ❌ Hardcoded values instead of constants

#### Required Patterns
- ✅ `templateUrl: './component.html'`
- ✅ `styleUrls: ['./component.scss']`
- ✅ Dedicated folder per component
- ✅ Use constants from `@mean-assessment/constants`
- ✅ Leverage shared components from `@mean-assessment/ui`

### Code Quality Standards
- **Constants Usage**: Replace all hardcoded values with constants from shared libraries
- **Shared Components**: Maximize use of UI library components (SpinnerComponent, AlertComponent, etc.)
- **TypeScript Typing**: Proper typing throughout, no `any` types
- **Error Handling**: Consistent error patterns using shared ERROR_MESSAGES
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## Professional UI/UX Architecture & Design System

### Current UI Fix Task (Active)
**Objective**: Fix 3 UI issues across reusable components for clean, professional view:

1. **Rectangle behind every card**: Remove pseudo-element overlays and decorative backgrounds from card components
2. **Placeholder persists inside labels**: Auto-suppress placeholders when labels exist in form inputs
3. **Top header moves with scrolling**: Implement proper sticky positioning to pin header at top

**Implementation Status**: 
- Card background artifacts: Fixed - removed extra pseudo-elements and background layers
- Form input placeholder/label conflict: Fixed - placeholder auto-suppresses when label present
- Header scroll positioning: Fixed - proper sticky positioning implemented
- Icon reliability: Ensured - all mat-icon components use material-icons fontSet

### Design System & Color Palette
**Professional Soft Color Scheme:**
```scss
// Primary Colors (Soft Blues)
--primary-50: #f0f9ff
--primary-100: #e0f2fe  
--primary-200: #bae6fd
--primary-300: #7dd3fc
--primary-400: #38bdf8
--primary-500: #0ea5e9  // Main brand color
--primary-600: #0284c7
--primary-700: #0369a1
--primary-800: #075985
--primary-900: #0c4a6e

// Secondary Colors (Soft Grays)
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

// Semantic Colors (Soft & Accessible)
--success: #10b981    // Soft green
--warning: #f59e0b    // Soft amber  
--error: #ef4444      // Soft red
--info: #3b82f6       // Soft blue
```

### Typography System
```scss
// Font Weights
--font-light: 300
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700

// Font Sizes (Fluid scaling)
--text-xs: 0.75rem     // 12px
--text-sm: 0.875rem    // 14px
--text-base: 1rem      // 16px
--text-lg: 1.125rem    // 18px
--text-xl: 1.25rem     // 20px
--text-2xl: 1.5rem     // 24px
--text-3xl: 1.875rem   // 30px
--text-4xl: 2.25rem    // 36px
```

### Spacing & Layout System
```scss
// Spacing Scale (8px base unit)
--space-1: 0.25rem     // 4px
--space-2: 0.5rem      // 8px  
--space-3: 0.75rem     // 12px
--space-4: 1rem        // 16px
--space-5: 1.25rem     // 20px
--space-6: 1.5rem      // 24px
--space-8: 2rem        // 32px
--space-10: 2.5rem     // 40px
--space-12: 3rem       // 48px
--space-16: 4rem       // 64px
--space-20: 5rem       // 80px
```

### Component Design Patterns
1. **Card-Based Layouts**: Clean, elevated cards with subtle shadows
2. **Micro-interactions**: Subtle hover states and transitions (300ms ease-out)
3. **Loading States**: Skeleton screens and progressive loading
4. **Empty States**: Contextual illustrations and helpful CTAs
5. **Error States**: Friendly error messages with recovery actions

### Content Standards
**ZERO Placeholder Content Policy:**
- No "Lorem ipsum" or placeholder text allowed
- All content must be contextual and realistic
- Dynamic content based on actual user data
- Professional copy suitable for technical assessments
- Proper internationalization considerations

### Accessibility Standards
- **WCAG 2.1 AA Compliance**: Proper contrast ratios (4.5:1 minimum)
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Independence**: Information not conveyed by color alone

### Responsive Design Principles
```scss
// Breakpoint System
--mobile: 480px
--tablet: 768px  
--desktop: 1024px
--large: 1280px
--xl: 1536px

// Mobile-first approach with progressive enhancement
@media (min-width: var(--tablet)) { /* Tablet styles */ }
@media (min-width: var(--desktop)) { /* Desktop styles */ }
```

### Animation & Transitions
```scss
// Standard timing functions
--ease-linear: cubic-bezier(0, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

// Animation durations
--duration-75: 75ms
--duration-100: 100ms
--duration-150: 150ms
--duration-200: 200ms
--duration-300: 300ms
--duration-500: 500ms
```

### Performance Standards
- **OnPush Change Detection**: All components use OnPush strategy
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: WebP format with fallbacks
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Lighthouse Score**: Target 90+ for Performance, Accessibility, Best Practices