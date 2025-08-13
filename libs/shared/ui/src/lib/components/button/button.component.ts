import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'basic' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab' | 'text' | 'outlined';
export type ButtonColor = 'primary' | 'accent' | 'warn' | 'basic' | 'success' | 'info' | 'teal';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  private router = inject(Router);

  @Input() variant: ButtonVariant = 'basic';
  @Input() color: ButtonColor = 'teal';
  @Input() size: ButtonSize = 'medium';
  @Input() content?: string;
  @Input() icon?: string;
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() ariaLabel?: string;
  @Input() type?: 'button' | 'submit' | 'reset';
  @Input() routerLink?: string; // New routing support
  @Input() external = false; // For external links

  @Output() buttonClick = new EventEmitter<Event>();


  getButtonClasses(): string {
    const classes = [`button-${this.size}`];
    
    if (this.fullWidth) {
      classes.push('button-full-width');
    }
    
    return classes.join(' ');
  }

  getSpinnerSize(): number {
    switch (this.size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      // Handle routing if routerLink is provided
      if (this.routerLink) {
        if (this.external) {
          window.open(this.routerLink, '_blank');
        } else {
          this.router.navigate([this.routerLink]);
        }
      }
      
      // Always emit the click event for custom handling
      this.buttonClick.emit(event);
    }
  }
}