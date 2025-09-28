import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { concat, of, EMPTY, timer } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, takeUntil } from 'rxjs/operators';
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
          const sessionExpirationRaw = localStorage.getItem(this.authConfig.auth.tokenExpirationKey);
          const accessExpirationRaw = localStorage.getItem(this.authConfig.auth.accessTokenExpirationKey);

          if (!token || !sessionExpirationRaw) {
            this.clearPersistedAuth();
            return of(AuthActions.initializeAuthFailure());
          }

          const now = Date.now();
          const sessionExpiration = parseInt(sessionExpirationRaw, 10);

          if (Number.isNaN(sessionExpiration) || now >= sessionExpiration) {
            this.clearPersistedAuth();
            return of(AuthActions.initializeAuthFailure());
          }

          const accessExpiration = accessExpirationRaw ? parseInt(accessExpirationRaw, 10) : Number.NaN;
          if (!accessExpirationRaw || Number.isNaN(accessExpiration) || now >= accessExpiration) {
            return of(AuthActions.refreshToken());
          }

          const bootstrap$ = of(
            AuthActions.initializeAuthSuccess({
              user: { firstName: 'Unknown', lastName: 'User', email: '', id: '' } as unknown as User,
              token,
            })
          );

          const profile$ = this.http
            .get<{ user: User }>(`${this.authConfig.apiUrl}${API_ROUTES.USERS.PROFILE_ME}`)
            .pipe(
              map((response) =>
                AuthActions.initializeAuthSuccess({ user: { ...response.user, updatedAt: new Date() }, token })
              ),
              catchError((error) =>
                of(AuthActions.refreshTokenFailure({ error: this.extractErrorMessage(error) }))
              )
            );

          return concat(bootstrap$, profile$);
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
        this.http
          .post<AuthResponse>(
            `${this.authConfig.apiUrl}${API_ROUTES.AUTH.SIGNIN}`,
            credentials,
            { withCredentials: true }
          )
          .pipe(
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
        this.http
          .post<AuthResponse>(
            `${this.authConfig.apiUrl}${API_ROUTES.AUTH.SIGNUP}`,
            userData,
            { withCredentials: true }
          )
          .pipe(
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

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(() =>
        this.http
          .post<AuthResponse>(
            `${this.authConfig.apiUrl}${API_ROUTES.AUTH.REFRESH}`,
            {},
            { withCredentials: true }
          )
          .pipe(
            map((authResponse) => {
              this.persistAuthData(authResponse.accessToken, { isRefresh: true });
              return AuthActions.refreshTokenSuccess({ authResponse });
            }),
            catchError((error) =>
              of(AuthActions.refreshTokenFailure({ error: this.extractErrorMessage(error) }))
            )
          )
      )
    )
  );

  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      switchMap(({ authResponse }) =>
        this.http
          .get<{ user: User }>(`${this.authConfig.apiUrl}${API_ROUTES.USERS.PROFILE_ME}`)
          .pipe(
            map((response) =>
              AuthActions.initializeAuthSuccess({
                user: { ...response.user, updatedAt: new Date() },
                token: authResponse.accessToken,
              })
            ),
            catchError((error) =>
              of(AuthActions.refreshTokenFailure({ error: this.extractErrorMessage(error) }))
            )
          )
      )
    )
  );

  scheduleAccessTokenRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AuthActions.initializeAuthSuccess,
        AuthActions.signinSuccess,
        AuthActions.signupSuccess,
        AuthActions.refreshTokenSuccess
      ),
      switchMap(() => {
        const expiresAt = this.getAccessTokenExpirationMs();
        if (!expiresAt) {
          return EMPTY;
        }

        const now = Date.now();
        const buffer = this.authConfig.auth.accessTokenRefreshBuffer;
        const delay = Math.max(expiresAt - now - buffer, 0);

        if (expiresAt <= now || delay <= 0) {
          return of(AuthActions.refreshToken());
        }

        return timer(delay).pipe(
          map(() => AuthActions.refreshToken()),
          takeUntil(
            this.actions$.pipe(
              ofType(AuthActions.signout, AuthActions.refreshTokenFailure)
            )
          )
        );
      })
    )
  );

  signout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signout),
      map(() => {
        this.clearPersistedAuth();
        this.router.navigate(['/auth/login']);
        return AuthActions.signoutSuccess();
      })
    )
  );

  refreshTokenFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.refreshTokenFailure),
        tap(({ error }) => {
          this.clearPersistedAuth();
          console.warn('Session ended:', error);
          this.router.navigate(['/auth/login'], { queryParams: { reason: 'session-expired' } }).catch(() => {
            window.location.href = '/auth/login';
          });
        })
      ),
    { dispatch: false }
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

  private persistAuthData(token: string, options?: { isRefresh?: boolean }): void {
    const now = Date.now();
    localStorage.setItem(this.authConfig.auth.tokenKey, token);

    const accessExpiration = now + this.authConfig.auth.accessTokenTimeout;
    localStorage.setItem(
      this.authConfig.auth.accessTokenExpirationKey,
      accessExpiration.toString()
    );

    const sessionExpirationKey = this.authConfig.auth.tokenExpirationKey;
    const hasSessionExpiration = !!localStorage.getItem(sessionExpirationKey);

    if (!options?.isRefresh || !hasSessionExpiration) {
      const sessionExpiration = now + this.authConfig.auth.sessionTimeout;
      localStorage.setItem(sessionExpirationKey, sessionExpiration.toString());
    }
  }

  private clearPersistedAuth(): void {
    try {
      localStorage.removeItem(this.authConfig.auth.tokenKey);
      localStorage.removeItem(this.authConfig.auth.tokenExpirationKey);
      localStorage.removeItem(this.authConfig.auth.accessTokenExpirationKey);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiration');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_expiration');
    } catch {
      // ignore cleanup errors
    }
  }

  private getAccessTokenExpirationMs(): number | null {
    try {
      const key = this.authConfig.auth.accessTokenExpirationKey;
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const timestamp = parseInt(raw, 10);
      return Number.isNaN(timestamp) ? null : timestamp;
    } catch {
      return null;
    }
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) return error.error.message;
    if (error.error?.error?.message) return error.error.error.message;
    if (error.status === 401) {
      if (error.url && error.url.includes(API_ROUTES.AUTH.REFRESH)) {
        return ERROR_MESSAGES.AUTH.TOKEN_EXPIRED;
      }
      return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
    }
    return ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG;
  }
}
