import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AUTH_CONFIG } from '../lib/auth.config';
import { AppState } from './store/auth.types';
import { AuthActions } from './store/auth.actions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly store = inject(Store<AppState>);
  private readonly authConfig = inject(AUTH_CONFIG);
  private readonly actions$ = inject(Actions);

  private refreshInProgress = false;

  private readonly publicAuthEndpoints = [
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/refresh',
  ];

  private isPublicAuthEndpoint(url: string): boolean {
    return this.publicAuthEndpoints.some((endpoint) => url.includes(endpoint));
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(this.authConfig.auth.tokenKey);
    const isPublic = this.isPublicAuthEndpoint(req.url);
    const authReq = token && !isPublic ? this.addAuthHeader(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || isPublic) {
          return throwError(() => error);
        }

        if (!token) {
          this.store.dispatch(AuthActions.signout());
          return throwError(() => error);
        }

        return this.handleUnauthorized(authReq, next);
      })
    );
  }

  private handleUnauthorized(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.refreshInProgress) {
      this.refreshInProgress = true;
      this.store.dispatch(AuthActions.refreshToken());
    }

    return this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess, AuthActions.refreshTokenFailure),
      take(1),
      switchMap((action) => {
        this.refreshInProgress = false;

        if (action.type === AuthActions.refreshTokenFailure.type) {
          return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
        }

        const refreshedToken = action.authResponse.accessToken;
        const updatedRequest = this.addAuthHeader(req, refreshedToken);
        return next.handle(updatedRequest);
      })
    );
  }

  private addAuthHeader<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}


