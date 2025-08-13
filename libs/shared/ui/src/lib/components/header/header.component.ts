import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

export type HeaderVariant = 'primary' | 'accent' | 'basic';

@Component({
  selector: 'ui-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() variant: HeaderVariant = 'primary';
  @Input() brandText?: string;
  @Input() brandIcon?: string;
  @Input() brandImage?: string;
  @Input() brandLink?: string = '/';
  @Input() navigationItems?: NavigationItem[];
  @Input() showMobileMenu = true;
  @Input() showSearch = false;
  @Input() showNotifications = false;
  @Input() notificationCount = 0;
  @Input() user?: UserInfo;
  @Input() userMenuItems?: NavigationItem[];
  @Input() actionButtons?: ActionButton[];
  @Input() userRole?: string;
  @Input() signOutText = 'Sign Out';

  @Output() mobileMenuClick = new EventEmitter<void>();
  @Output() searchClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<ActionButton>();

  getHeaderClasses(): string {
    const classes = [];
    
    if (this.variant === 'basic') {
      classes.push('header-basic');
    }
    
    return classes.join(' ');
  }

  getUserInitials(): string {
    if (!this.user?.name) return '?';
    
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  onMobileMenuClick(): void {
    this.mobileMenuClick.emit();
  }

  onSearchClick(): void {
    this.searchClick.emit();
  }

  onNotificationsClick(): void {
    this.notificationsClick.emit();
  }

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  onActionClick(action: ActionButton): void {
    if (!action.disabled && action.handler) {
      action.handler();
    }
    this.actionClick.emit(action);
  }
}

export interface NavigationItem {
  label: string;
  route?: string;
  icon?: string;
  exact?: boolean;
  children?: NavigationItem[];
}

export interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

export interface ActionButton {
  label: string;
  icon?: string;
  variant?: 'text' | 'raised' | 'outlined' | 'icon';
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  handler?: () => void;
}