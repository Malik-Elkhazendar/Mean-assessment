import { User } from '@mean-assessment/data-models';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface AppState {
  auth: AuthState;
}


