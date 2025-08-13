import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'medium';
  @Input() content?: string | number;
  @Input() dot = false;
  @Input() outlined = false;
  @Input() removable = false;

  getBadgeClasses(): string {
    const classes = [];
    
    classes.push(`badge-${this.variant}`);
    classes.push(`badge-${this.size}`);
    
    if (this.dot) classes.push('badge-dot');
    if (this.outlined) classes.push('badge-outlined');
    if (this.removable) classes.push('badge-removable');
    
    return classes.join(' ');
  }

  onRemove(): void {
    // Emit remove event if needed in the future
  }
}