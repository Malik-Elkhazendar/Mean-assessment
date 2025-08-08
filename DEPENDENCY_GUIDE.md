# Dependency Management Guide

## 📋 Peer Dependency Requirements

### Angular Material
- `rxjs`: ^6.5.3 || ^7.4.0
- `@angular/cdk`: 20.1.5
- `@angular/core`: ^20.0.0 || ^21.0.0
- `@angular/forms`: ^20.0.0 || ^21.0.0
- `@angular/common`: ^20.0.0 || ^21.0.0
- `@angular/platform-browser`: ^20.0.0 || ^21.0.0

### NestJS Mongoose
- `@nestjs/common`: ^10.0.0 || ^11.0.0
- `@nestjs/core`: ^10.0.0 || ^11.0.0
- `mongoose`: ^7.0.0 || ^8.0.0
- `rxjs`: ^7.0.0

## ✅ Compatible Versions in This Project
- Angular: ~20.1.0
- NestJS: ^11.0.0
- RxJS: ^7.8.0
- Mongoose: Latest ^8.x

## 🛡️ Prevention Strategies

### 1. Always check compatibility first:
```bash
npm info [package-name] peerDependencies
```

### 2. Install by ecosystem:
```bash
# Backend packages
npm install @nestjs/mongoose @nestjs/jwt @nestjs/passport

# Frontend packages
npm install @angular/material @angular/cdk

# Shared packages
npm install class-validator class-transformer
```

### 3. Use exact versions for critical packages:
```bash
npm install @angular/material@20.1.5 @angular/cdk@20.1.5
```

## 🔧 Configuration Files
- `.npmrc` - Configured with `legacy-peer-deps=true`
- This guide - Keep updated when adding new packages
