/// <reference types="jest" />
/// <reference types="node" />
/* eslint-disable @typescript-eslint/no-explicit-any */
// Declarations for jest to satisfy TypeScript in linting context
declare const jest: any;
// Jest setup for global test configuration

// Mock Angular Material Icons
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

// Mock ResizeObserver for Angular CDK
(globalThis as any).ResizeObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock console methods to reduce noise in tests
(globalThis as any).console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set up environment variables for testing
// Ensure process.env exists and set NODE_ENV for tests without Node types
// Ensure process.env exists and set NODE_ENV for tests
(globalThis as any).process = (globalThis as any).process ?? { env: {} };
(globalThis as any).process.env = {
  ...((globalThis as any).process.env || {}),
  NODE_ENV: 'test',
};

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock CSS.supports for Angular Material
Object.defineProperty(CSS, 'supports', {
  value: jest.fn(() => false)
});