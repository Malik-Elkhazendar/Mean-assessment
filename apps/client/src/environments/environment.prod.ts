export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api', // Backend API URL - update for actual production deployment
  appName: 'MEAN Assessment',
  version: '1.0.0',
  features: {
    enableLogging: true, // Enable logging in production for debugging during assessment
    enableDevTools: false,
    enableAnimations: true,
  },
  auth: {
    tokenKey: 'mean_auth_token',
    tokenExpirationKey: 'mean_token_expiration',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds as required by assessment
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
};
