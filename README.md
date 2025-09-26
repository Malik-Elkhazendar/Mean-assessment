# MEAN Stack Assessment

A modern full-stack web application built with Angular, NestJS, MongoDB, and TypeScript in an Nx monorepo.

## ✨ Features

- **Authentication**: Signup, signin, signout with 8-hour JWT sessions
- **Product Management**: Create, read, update, delete products with search and pagination
- **Dashboard**: Personalized user dashboard with statistics
- **Responsive Design**: Mobile-first Material Design interface
- **Password Reset**: Complete forgot password flow with email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment configuration**
Create `apps/server/.env`:
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h
JWT_ACCESS_EXPIRES_IN=15m
SESSION_TTL_MS=28800000
REFRESH_TOKEN_TTL_MS=900000
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=Lax
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-username
MAIL_PASS=your-password
```

3. **Start the application**
```bash
# Backend (Terminal 1)
npx nx serve server

# Frontend (Terminal 2)  
npx nx serve client
```

The app will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

## 📁 Project Structure

```
apps/
├── client/           # Angular frontend
└── server/           # NestJS backend

libs/shared/          # Shared libraries
├── auth/            # NgRx authentication
├── constants/       # API routes, error messages
├── data-models/     # TypeScript interfaces
├── dto/             # Data transfer objects
└── ui/              # Reusable components
```

## 🔐 Authentication Flow

1. **Signup/Signin**: JWT tokens with 8-hour expiry
2. **Refresh Tokens**: HttpOnly cookie rotation keeps sessions alive for up to 8 hours total
3. **Protected Routes**: Dashboard and products require authentication
4. **Session Persistence**: Access token stored client-side, refresh token stays in cookie
5. **Password Reset**: Email-based token reset system

## 📦 Product Features

- **CRUD Operations**: Full create, read, update, delete
- **User-Scoped**: Each user manages their own products
- **Search & Filter**: Text search and category filtering
- **Pagination**: Efficient data loading
- **Statistics**: Product counts and inventory analytics

## 🛠️ Development

### Common Commands
```bash
# Testing
npx nx test server
npx nx test client

# Linting
npx nx lint

# Build for production
npx nx build server --configuration=production
npx nx build client --configuration=production
```

### Key Technologies
- **Frontend**: Angular 20+, NgRx, Angular Material
- **Backend**: NestJS, Mongoose, Passport JWT
- **Database**: MongoDB with Atlas cloud hosting
- **Validation**: class-validator for DTOs
- **Email**: Nodemailer with SMTP integration


##  Live Demo

- **Frontend**: https://mean-frontend-6690529964.us-central1.run.app/
- **API Docs (Swagger)**: https://mean-backend-6690529964.me-central1.run.app/docs#/
- **Video Walkthrough**: https://drive.google.com/file/d/1gUHbDM-XbbgbEAfDhtdL23xJsYsE--Cc/view?usp=sharing

The application includes sample data and is ready for demonstration with full authentication and product management workflows.

---

**Built with the MEAN Stack (MongoDB, Express/NestJS, Angular, Node.js)**
