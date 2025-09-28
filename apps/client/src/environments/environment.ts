export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appName: 'MEAN Assessment',
  version: '1.0.0',
  features: {
    enableLogging: true,
    enableDevTools: true,
    enableAnimations: true,
  },
  auth: {
    tokenKey: 'mean_auth_token',
    tokenExpirationKey: 'mean_token_expiration',
    accessTokenExpirationKey: 'mean_access_token_expiration',
    sessionTimeout: 8 * 60 * 60 * 1000,
    accessTokenTimeout: 15 * 60 * 1000,
    accessTokenRefreshBuffer: 60 * 1000,
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
};
