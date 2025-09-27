import { User } from '@mean-assessment/data-models';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  initialized: boolean;
  message: string | null;
}

export interface AppState {
  auth: AuthState;
}


