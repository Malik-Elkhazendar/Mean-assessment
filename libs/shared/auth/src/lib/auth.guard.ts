import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AppState } from './store/auth.types';
import { AuthActions } from './store/auth.actions';
import { selectAuthInitialized, selectIsAuthenticated } from './store/auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly store = inject(Store<AppState>);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.store.dispatch(AuthActions.initializeAuth());
    return this.store.select(selectAuthInitialized).pipe(
      filter((initialized) => initialized),
      take(1),
      switchMap(() => this.store.select(selectIsAuthenticated)),
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
      })
    );
  }
}


