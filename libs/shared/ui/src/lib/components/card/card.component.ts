import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ButtonComponent } from '../button/button.component';

export type CardElevation = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CardVariant = 'outlined' | 'elevated' | 'filled';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, ButtonComponent],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() image?: string;
  @Input() imageAlt?: string;
  @Input() imageFit: 'cover' | 'contain' = 'cover';
  @Input() avatar?: string;
  @Input() avatarType: 'icon' | 'image' | 'text' = 'icon';
  @Input() variant: CardVariant = 'elevated';
  @Input() elevation: CardElevation = 1;
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() dense = false;
  @Input() contentClass?: string;
  @Input() footerText?: string;
  @Input() actionsAlignment: 'start' | 'end' = 'start';
  @Input() actions?: CardAction[];
  @Input() headerActions?: CardAction[];

  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.avatar || (this.headerActions && this.headerActions.length > 0));
  }

  get hasContent(): boolean {
    return !!(this.description || this.contentClass === 'content-scrollable');
  }

  get hasActions(): boolean {
    return !!(this.actions && this.actions.length > 0);
  }

  get hasFooter(): boolean {
    return !!(this.footerText);
  }

  getCardClasses(): string {
    const classes = [`card-${this.variant}`];
    
    if (this.variant === 'elevated') {
      classes.push(`elevation-${this.elevation}`);
    }
    
    if (this.hoverable) {
      classes.push('card-hover');
    }
    
    if (this.clickable) {
      classes.push('card-clickable');
    }
    
    if (this.dense) {
      classes.push('card-dense');
    }
    
    return classes.join(' ');
  }

  onActionClick(action: CardAction): void {
    if (!action.disabled && action.handler) {
      action.handler();
    }
  }

  trackByAction(index: number, action: CardAction): string {
    return action.label + index;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load card image:', this.image);
  }
}

export interface CardAction {
  label: string;
  icon?: string;
  variant?: 'text' | 'raised' | 'outlined';
  color?: 'primary' | 'accent' | 'warn' | 'success' | 'info' | 'teal';
  disabled?: boolean;
  handler?: () => void;
}