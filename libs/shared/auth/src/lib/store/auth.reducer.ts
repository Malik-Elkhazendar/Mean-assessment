import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '@mean-assessment/data-models';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  message: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
  message: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.initializeAuth, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.initializeAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    loading: false,
    error: null,
    initialized: true,
  })),
  on(AuthActions.initializeAuthFailure, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: true,
  })),
  on(AuthActions.signin, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.signinSuccess, (state, { authResponse }) => ({
    ...state,
    user: { ...authResponse.user, updatedAt: new Date() },
    token: authResponse.accessToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.signinFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error,
  })),
  on(AuthActions.signup, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.signupSuccess, (state, { authResponse }) => ({
    ...state,
    user: { ...authResponse.user, updatedAt: new Date() },
    token: authResponse.accessToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.signupFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error,
  })),
  on(AuthActions.signout, AuthActions.signoutSuccess, () => ({ ...initialState })),
  on(AuthActions.clearError, (state) => ({ ...state, error: null })),
  on(AuthActions.clearMessage, (state) => ({ ...state, message: null })),
  // Forgot password flow
  on(AuthActions.forgotPassword, (state) => ({ ...state, loading: true, error: null, message: null })),
  on(AuthActions.forgotPasswordSuccess, (state, { message }) => ({
    ...state,
    loading: false,
    error: null,
    message: message ?? 'If an account exists, a reset link has been sent.',
  })),
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  // Reset password flow
  on(AuthActions.resetPassword, (state) => ({ ...state, loading: true, error: null, message: null })),
  on(AuthActions.resetPasswordSuccess, (state, { message }) => ({
    ...state,
    loading: false,
    error: null,
    message: message ?? 'Password reset successful',
  })),
  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);


