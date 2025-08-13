import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() title?: string;
  @Input() message!: string;
  @Input() dismissible = true;
  @Input() actions?: { label: string; value: string }[];

  @Output() dismissed = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<string>();

  getIcon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getActionColor(): string {
    switch (this.type) {
      case 'success': return 'primary';
      case 'error': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  onDismiss(): void {
    this.dismissed.emit();
  }

  onActionClick(action: { label: string; value: string }): void {
    this.actionClicked.emit(action.value);
  }

  trackByAction(index: number, action: { label: string; value: string }): string {
    return action.value;
  }
}