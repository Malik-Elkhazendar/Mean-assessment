import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { User, AuthResponse } from '@mean-assessment/data-models';
import { API_ROUTES, ERROR_MESSAGES } from '@mean-assessment/constants';
import { AUTH_CONFIG } from '../auth.config';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly http = inject(HttpClient);
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly authConfig = inject(AUTH_CONFIG);

  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      switchMap(() => {
        try {
          const token = localStorage.getItem(this.authConfig.auth.tokenKey);
          const expiration = localStorage.getItem(this.authConfig.auth.tokenExpirationKey);
          if (!token || !expiration) return of(AuthActions.initializeAuthFailure());

          const expirationDate = new Date(parseInt(expiration, 10));
          if (new Date() > expirationDate) {
            localStorage.removeItem(this.authConfig.auth.tokenKey);
            localStorage.removeItem(this.authConfig.auth.tokenExpirationKey);
            return of(AuthActions.initializeAuthFailure());
          }

          const bootstrap$ = of(
            AuthActions.initializeAuthSuccess({
              user: { firstName: 'Unknown', lastName: 'User', email: '', id: '' } as unknown as User,
              token,
            })
          );

          const refresh$ = this.http
            .get<{ user: User }>(`${this.authConfig.apiUrl}${API_ROUTES.USERS.PROFILE_ME}`)
            .pipe(
              map((response) =>
                AuthActions.initializeAuthSuccess({ user: { ...response.user, updatedAt: new Date() }, token })
              ),
              catchError(() => of(AuthActions.clearError()))
            );

          return bootstrap$.pipe(switchMap(() => refresh$));
        } catch {
          // On unexpected errors, fail initialization gracefully
          return of(AuthActions.initializeAuthFailure());
        }
      })
    )
  );

  signin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signin),
      exhaustMap(({ credentials }) =>
        this.http.post<AuthResponse>(`${this.authConfig.apiUrl}${API_ROUTES.AUTH.SIGNIN}`, credentials).pipe(
          map((authResponse) => {
            this.persistAuthData(authResponse.accessToken);
            return AuthActions.signinSuccess({ authResponse });
          }),
          catchError((error) => of(AuthActions.signinFailure({ error: this.extractErrorMessage(error) })))
        )
      )
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      exhaustMap(({ userData }) =>
        this.http.post<AuthResponse>(`${this.authConfig.apiUrl}${API_ROUTES.AUTH.SIGNUP}`, userData).pipe(
          map((authResponse) => {
            this.persistAuthData(authResponse.accessToken);
            return AuthActions.signupSuccess({ authResponse });
          }),
          catchError((error) => of(AuthActions.signupFailure({ error: this.extractErrorMessage(error) })))
        )
      )
    )
  );

  signinSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signinSuccess),
        tap(() => {
          const urlTree = this.router.parseUrl(this.router.url);
          const returnUrl = urlTree.queryParams['returnUrl'];
          if (returnUrl) this.router.navigateByUrl(returnUrl);
          else this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  signupSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signupSuccess),
        tap(() => {
          const urlTree = this.router.parseUrl(this.router.url);
          const returnUrl = urlTree.queryParams['returnUrl'];
          if (returnUrl) this.router.navigateByUrl(returnUrl);
          else this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  signout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signout),
      map(() => {
        try {
          localStorage.removeItem(this.authConfig.auth.tokenKey);
          localStorage.removeItem(this.authConfig.auth.tokenExpirationKey);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_expiration');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_expiration');
        } catch {
          // ignore cleanup errors
        }
        this.router.navigate(['/auth/login']);
        return AuthActions.signoutSuccess();
      })
    )
  );

  // Forgot password
  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.http
          .post<{ message?: string }>(`${this.authConfig.apiUrl}${API_ROUTES.AUTH.FORGOT_PASSWORD}`, { email })
          .pipe(
            map((response) => AuthActions.forgotPasswordSuccess({ message: response.message })),
            catchError((error) => of(AuthActions.forgotPasswordFailure({ error: this.extractErrorMessage(error) })))
          )
      )
    )
  );

  // Reset password
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      exhaustMap(({ email, resetToken, newPassword }) =>
        this.http
          .post<{ message?: string }>(`${this.authConfig.apiUrl}${API_ROUTES.AUTH.RESET_PASSWORD}`, {
            email,
            resetToken,
            newPassword,
          })
          .pipe(
            map((response) => AuthActions.resetPasswordSuccess({ message: response.message })),
            catchError((error) => of(AuthActions.resetPasswordFailure({ error: this.extractErrorMessage(error) })))
          )
      )
    )
  );

  // Navigate to login after successful password reset (with small delay for UX)
  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.resetPasswordSuccess),
        tap(() => {
          setTimeout(() => {
            this.router.navigate(['/auth/login']).catch(() => {
              window.location.href = '/auth/login';
            });
          }, 1500);
        })
      ),
    { dispatch: false }
  );

  private persistAuthData(token: string): void {
    const expirationTime = Date.now() + this.authConfig.auth.sessionTimeout;
    localStorage.setItem(this.authConfig.auth.tokenKey, token);
    localStorage.setItem(this.authConfig.auth.tokenExpirationKey, expirationTime.toString());
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) return error.error.message;
    if (error.error?.error?.message) return error.error.error.message;
    if (error.status === 401) return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
    return ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG;
  }
}


