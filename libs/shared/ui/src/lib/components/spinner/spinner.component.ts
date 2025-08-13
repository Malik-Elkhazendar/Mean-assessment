import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerColor = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() color: SpinnerColor = 'primary';
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() overlay = false;
  @Input() message?: string;

  getDiameter(): number {
    switch (this.size) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  }

  getStrokeWidth(): number {
    switch (this.size) {
      case 'small': return 2;
      case 'medium': return 3;
      case 'large': return 4;
      default: return 3;
    }
  }
}