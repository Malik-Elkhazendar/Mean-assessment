import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() size: ModalSize = 'medium';
  @Input() closable = true;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() showHeader = true;
  @Input() showFooter = false;

  @Output() close = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (this.isOpen && this.closeOnEscape && event.key === 'Escape') {
      this.onClose();
    }
  }

  getModalClasses(): string {
    const classes = ['modal-container'];
    classes.push(`modal-${this.size}`);
    return classes.join(' ');
  }

  onBackdropClick(): void {
    this.backdropClick.emit();
    if (this.closeOnBackdropClick) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onModalClick(event: Event): void {
    // Prevent backdrop click when clicking inside modal
    event.stopPropagation();
  }
}