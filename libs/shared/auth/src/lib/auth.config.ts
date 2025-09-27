import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  apiUrl: string;
  auth: {
    tokenKey: string;
    tokenExpirationKey: string;
    accessTokenExpirationKey: string;
    sessionTimeout: number;
    accessTokenTimeout: number;
  };
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');


