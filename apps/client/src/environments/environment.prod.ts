export const environment = {
  production: true,
  // Use base API origin without path; routes already include '/api'
  apiUrl: 'http://localhost:3000',
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
    accessTokenExpirationKey: 'mean_access_token_expiration',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds as required by assessment
    accessTokenTimeout: 15 * 60 * 1000,
    accessTokenRefreshBuffer: 60 * 1000,
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
};
