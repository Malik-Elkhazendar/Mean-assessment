import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  apiUrl: string;
  auth: {
    tokenKey: string;
    tokenExpirationKey: string;
    sessionTimeout: number;
  };
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');


