import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { authReducer } from '@mean-assessment/auth';
import { AuthEffects, AuthInterceptor, AUTH_CONFIG } from '@mean-assessment/auth';
import { productsReducer, ProductsEffects } from '@mean-assessment/products-state';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    // NgRx Store Configuration
    provideStore({ auth: authReducer, products: productsReducer }),
    provideEffects([AuthEffects, ProductsEffects]),
    // NgRx DevTools - maxAge 25, logOnly in production
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // Auth Configuration Provider
    {
      provide: AUTH_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl,
        auth: environment.auth
      }
    },
    // Material Icons Configuration
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-icons'
      }
    },
  ],
};
