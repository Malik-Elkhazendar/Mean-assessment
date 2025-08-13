/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { MailerService } from '@nestjs-modules/mailer';
import { APP_GUARD } from '@nestjs/core';

// Jest globals are provided via tsconfig.e2e.json types

export let app: INestApplication;
export let testRequest: ReturnType<typeof request>;

interface E2EUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Global E2E test setup - runs once before all tests
 */
beforeAll(async () => {
  // Force test database URI for the app's DatabaseModule
  process.env.MONGODB_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/mean-assessment-e2e-test';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
    ],
  })
    .overrideProvider(MailerService)
    .useValue({
      sendMail: jest.fn().mockResolvedValue(undefined),
    })
    // Disable ThrottlerGuard globally in tests by overriding APP_GUARD
    .overrideProvider(APP_GUARD)
    .useValue({ canActivate: () => true })
    .compile();

  app = moduleFixture.createNestApplication();
  
  // Apply same configurations as main application
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Relax or disable throttling for tests
  process.env.RATE_LIMIT_TTL = '60000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000000';
  process.env.RATE_LIMIT_AUTH_TTL = '60000';
  process.env.RATE_LIMIT_AUTH_MAX_REQUESTS = '1000000';

  await app.init();
  // supertest namespace import is callable directly
  testRequest = request(app.getHttpServer());
});

/**
 * Global E2E test cleanup - runs once after all tests
 */
afterAll(async () => {
  if (app) {
    await app.close();
  }
});

/**
 * Test utilities and helpers
 */
export class TestUtils {
  /**
   * Generate test user data
   */
  static generateTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
      firstName: `Test${suffix}`,
      lastName: `User${suffix}`,
      email: `test${suffix}.user${timestamp}@example.com`,
      password: 'TestPassword123!',
    };
  }

  /**
   * Generate test product data
   */
  static generateTestProduct(suffix = '') {
    const timestamp = Date.now();
    return {
      name: `Test Product ${suffix} ${timestamp}`,
      description: `This is a test product description for testing purposes ${suffix}`,
      price: 99.99,
      category: 'Electronics',
      quantity: 10,
      imageUrl: 'https://via.placeholder.com/300x300.png',
    };
  }

  /**
   * Create test user and return auth token
   */
  static async createTestUserAndGetToken(userSuffix = ''): Promise<{
    user: E2EUser;
    token: string;
    email: string;
    password: string;
  }> {
    const testUser = TestUtils.generateTestUser(userSuffix);
    
    const signupResponse = await testRequest
      .post('/api/auth/signup')
      .send(testUser)
      .expect(201);

    return {
      user: signupResponse.body.user,
      token: signupResponse.body.accessToken,
      email: testUser.email,
      password: testUser.password,
    };
  }

  /**
   * Get auth headers for authenticated requests
   */
  static getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Clean up test data (users, products, etc.)
   */
  static async cleanupTestData() {
    // In a real scenario, you might want to clean up test data
    // For now, we'll rely on the test database being reset
  }
}

/**
 * Custom matchers for better test assertions
 */
expect.extend({
  toBeValidObjectId(received: string) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const pass = objectIdRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },

  toBeValidJWT(received: string) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = jwtRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },
});

// Extend Jest matchers
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidObjectId(): R;
      toBeValidJWT(): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// Remove any conflicting expect function definitions that might interfere