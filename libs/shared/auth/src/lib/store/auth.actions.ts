import { createAction, props } from '@ngrx/store';
import { User, AuthResponse } from '@mean-assessment/data-models';
import { LoginDto, SignupDto } from '@mean-assessment/dto';

export const initializeAuth = createAction('[Auth] Initialize Auth');
export const initializeAuthSuccess = createAction(
  '[Auth] Initialize Auth Success',
  props<{ user: User; token: string }>()
);
export const initializeAuthFailure = createAction('[Auth] Initialize Auth Failure');

export const signin = createAction('[Auth] Sign In', props<{ credentials: LoginDto }>());
export const signinSuccess = createAction('[Auth] Sign In Success', props<{ authResponse: AuthResponse }>());
export const signinFailure = createAction('[Auth] Sign In Failure', props<{ error: string }>());

export const signup = createAction('[Auth] Sign Up', props<{ userData: SignupDto }>());
export const signupSuccess = createAction('[Auth] Sign Up Success', props<{ authResponse: AuthResponse }>());
export const signupFailure = createAction('[Auth] Sign Up Failure', props<{ error: string }>());

export const signout = createAction('[Auth] Sign Out');
export const logout = createAction('[Auth] Sign Out'); // alias
export const signoutSuccess = createAction('[Auth] Sign Out Success');

export const clearError = createAction('[Auth] Clear Error');
export const clearMessage = createAction('[Auth] Clear Message');

// Forgot Password
export const forgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ email: string }>()
);
export const forgotPasswordSuccess = createAction(
  '[Auth] Forgot Password Success',
  props<{ message?: string }>()
);
export const forgotPasswordFailure = createAction(
  '[Auth] Forgot Password Failure',
  props<{ error: string }>()
);

// Reset Password
export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ email: string; resetToken: string; newPassword: string }>()
);
export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success',
  props<{ message?: string }>()
);
export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: string }>()
);

export const AuthActions = {
  initializeAuth,
  initializeAuthSuccess,
  initializeAuthFailure,
  signin,
  signinSuccess,
  signinFailure,
  signup,
  signupSuccess,
  signupFailure,
  signout,
  logout,
  signoutSuccess,
  clearError,
  clearMessage,
  forgotPassword,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPassword,
  resetPasswordSuccess,
  resetPasswordFailure,
};


