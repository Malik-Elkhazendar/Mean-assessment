import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AUTH_CONFIG } from '../lib/auth.config';
import { AppState } from './store/auth.types';
import { AuthActions } from './store/auth.actions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly store = inject(Store<AppState>);
  private readonly authConfig = inject(AUTH_CONFIG);

  private readonly publicAuthEndpoints = ['/api/auth/signin', '/api/auth/signup', '/api/auth/forgot-password', '/api/auth/reset-password'];

  private isPublicAuthEndpoint(url: string): boolean {
    return this.publicAuthEndpoints.some((endpoint) => url.includes(endpoint));
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(this.authConfig.auth.tokenKey);

    if (token && !this.isPublicAuthEndpoint(req.url)) {
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.store.dispatch(AuthActions.signout());
          }
          throw error;
        })
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          this.store.dispatch(AuthActions.signout());
        }
        throw error;
      })
    );
  }
}


