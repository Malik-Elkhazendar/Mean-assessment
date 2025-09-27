import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (auth: AuthState) => auth.user);
export const selectToken = createSelector(selectAuthState, (auth: AuthState) => auth.token);
export const selectIsAuthenticated = createSelector(selectAuthState, (auth: AuthState) => auth.isAuthenticated);
export const selectAuthLoading = createSelector(selectAuthState, (auth: AuthState) => auth.loading);
export const selectAuthRefreshing = createSelector(selectAuthState, (auth: AuthState) => auth.refreshing);
export const selectAuthError = createSelector(selectAuthState, (auth: AuthState) => auth.error);
export const selectAuthInitialized = createSelector(selectAuthState, (auth: AuthState) => auth.initialized);
export const selectAuthMessage = createSelector(selectAuthState, (auth: AuthState) => auth.message);
export const selectUserFullName = createSelector(selectUser, (user) => (user ? `${user.firstName} ${user.lastName}` : ''));


