/**
 * MEAN Stack Assessment - Angular Root Component
 * 
 * This is the main Angular application shell that provides:
 * - Responsive navigation with Material Design sidenav
 * - Authentication-aware routing and navigation items
 * - NgRx state integration for user authentication status
 * - Mobile-first responsive design with breakpoint detection
 * - Shared UI components for consistent user experience
 * 
 * Navigation Structure:
 * - Public: Home page for unauthenticated users
 * - Protected: Dashboard, Products, Profile for authenticated users
 * 
 * Authentication Flow:
 * - Initializes auth state from localStorage on app startup
 * - Manages user session with 8-hour JWT token expiry
 * - Provides logout functionality that clears auth state
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, map } from 'rxjs';
import { HeaderComponent, FooterComponent, NavigationItem, UserInfo } from '@mean-assessment/ui';
import { selectUser, selectIsAuthenticated, selectUserFullName, AuthActions } from '@mean-assessment/auth';
import { APP_CONFIG, DASHBOARD_LAYOUT } from '@mean-assessment/constants';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly store = inject(Store);
  
  title = APP_CONFIG.APP_NAME;
  isMobile = false;
  sidenavOpened = false;

  /** Authentication state observables from NgRx store */
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  user$ = this.store.select(selectUser);
  userFullName$ = this.store.select(selectUserFullName);

  /** Transform user data for header component consumption */
  headerUser$: Observable<UserInfo | undefined> = this.user$.pipe(
    map(user => user ? {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatar: undefined
    } : undefined)
  );

  /** Navigation items for public (unauthenticated) users */
  publicNavigationItems: NavigationItem[] = [
    { label: 'Home', route: '/', icon: 'home', exact: true }
  ];

  /** Navigation items for authenticated users */
  authenticatedNavigationItems: NavigationItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', exact: false },
    { label: 'Products', route: '/products', icon: 'inventory', exact: false },
    { label: 'Profile', route: '/profile/edit', icon: 'person', exact: false }
  ];

  /** Dynamic navigation items based on authentication status */
  navigationItems$: Observable<NavigationItem[]> = this.isAuthenticated$.pipe(
    map(isAuth => isAuth ? this.authenticatedNavigationItems : this.publicNavigationItems)
  );

  /** Sidenav navigation items for mobile/tablet view */
  sidenavItems: NavigationItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Products', route: '/products', icon: 'inventory' },
    { label: 'Profile', route: '/profile/edit', icon: 'person' }
  ];

  /** User menu dropdown items */
  userMenuItems: NavigationItem[] = [
    { label: 'Profile', route: '/profile/edit', icon: 'person' },
    { label: 'Help', route: '/help', icon: 'help' }
  ];

  ngOnInit(): void {
    this.store.dispatch(AuthActions.initializeAuth());

    this.setupResponsiveNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configures responsive navigation behavior
   * Uses centralized breakpoint constants for consistency
   */
  private setupResponsiveNavigation(): void {
    this.breakpointObserver
      .observe([`(max-width: ${DASHBOARD_LAYOUT.BREAKPOINTS.MOBILE})`])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
        this.sidenavOpened = !this.isMobile;
      });
  }

  /** Toggle mobile sidenav visibility */
  onMobileMenuClick(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  /** Auto-close sidenav on mobile after navigation */
  onSidenavClosed(): void {
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  /** Placeholder for future search functionality */
  onSearchClick(): void {
    // TODO: Implement global search functionality
  }

  /**
   * Handles user logout by dispatching NgRx action
   * This will:
   * - Clear auth state from store
   * - Remove tokens from localStorage
   * - Redirect to login page
   */
  onLogoutClick(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
