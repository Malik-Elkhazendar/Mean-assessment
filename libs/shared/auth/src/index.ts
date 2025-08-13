// Barrel exports for the shared auth library

// Config
export { AUTH_CONFIG } from './lib/auth.config';
export type { AuthConfig } from './lib/auth.config';

// Interceptor and Guard
export { AuthInterceptor } from './lib/auth.interceptor';
export { AuthGuard } from './lib/auth.guard';

// Store: actions, reducer, selectors, types, effects
export * as AuthActions from './lib/store/auth.actions';
export { authReducer, initialState } from './lib/store/auth.reducer';
export * from './lib/store/auth.selectors';
export * from './lib/store/auth.types';
export { AuthEffects } from './lib/store/auth.effects';

// Optional placeholders kept for compatibility with any imports referencing them
export class LoginComponent {}
export class SignupComponent {}


