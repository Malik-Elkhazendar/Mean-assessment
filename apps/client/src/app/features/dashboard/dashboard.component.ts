import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { 
  AccountStatusCardComponent,
  ActivityListComponent,
  FeatureHighlightsComponent,
  HeaderComponent,
  SkeletonLoaderComponent
} from '@mean-assessment/ui';
import { selectUser, selectUserFullName, selectAuthLoading, selectIsAuthenticated } from '@mean-assessment/auth';
import { MINIMAL_DASHBOARD_CONTENT } from '@mean-assessment/constants';
import { AUTH_CONFIG, AuthConfig } from '@mean-assessment/auth';
import { inject as diInject } from '@angular/core';
import { timer, map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    AccountStatusCardComponent,
    ActivityListComponent,
    FeatureHighlightsComponent,
    HeaderComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly authConfig = diInject<AuthConfig>(AUTH_CONFIG);

  user$ = this.store.select(selectUser);
  userFullName$ = this.store.select(selectUserFullName);
  loading$ = this.store.select(selectAuthLoading);
  isAuthenticated$ = this.store.select(selectIsAuthenticated);

  // All content from shared constants - zero hardcoding
  readonly content = MINIMAL_DASHBOARD_CONTENT;

  // Sample activities (in real app, would come from API)
  readonly activities = [...this.content.RECENT_ACTIVITY.DEFAULT_ACTIVITIES];

  // Feature highlights
  readonly features = [...this.content.FEATURES.HIGHLIGHTS];

  // Session expiry text observable (updates every minute)
  sessionExpiry$ = timer(0, 60_000).pipe(map(() => this.getSessionExpiryText()));

  // Access token expiry text observable (shorter lifetime)
  accessTokenExpiry$ = timer(0, 30_000).pipe(map(() => this.getAccessTokenExpiryText()));

  private getTokenExpirationMs(): number | null {
    try {
      const key = this.authConfig.auth.tokenExpirationKey;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const ts = parseInt(raw, 10);
      return isNaN(ts) ? null : ts;
    } catch {
      return null;
    }
  }

  private getAccessTokenExpirationMs(): number | null {
    try {
      const key = this.authConfig.auth.accessTokenExpirationKey;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const ts = parseInt(raw, 10);
      return Number.isNaN(ts) ? null : ts;
    } catch {
      return null;
    }
  }

  private getSessionExpiryText(): string {
    const expiresAt = this.getTokenExpirationMs();
    if (!expiresAt) return 'N/A';
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) return 'Expired';
    const totalMinutes = Math.floor(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  }

  private getAccessTokenExpiryText(): string {
    const expiresAt = this.getAccessTokenExpirationMs();
    if (!expiresAt) return 'N/A';
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) return 'Expired';
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining` : `${seconds}s remaining`;
  }


  /**
   * Navigation methods
   */
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  // navigateToAnalytics removed
}
