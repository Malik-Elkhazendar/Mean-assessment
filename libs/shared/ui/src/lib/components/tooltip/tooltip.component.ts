import { Component, Input, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'ui-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnDestroy {
  @Input() content?: string;
  @Input() position: TooltipPosition = 'top';
  @Input() disabled = false;
  @Input() showDelay = 500;
  @Input() hideDelay = 100;

  isVisible = false;
  private timeoutId?: number;
  private hideTimeoutId?: number;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  onMouseEnter(): void {
    if (this.disabled || !this.content) return;
    
    this.clearTimeouts();
    this.timeoutId = window.setTimeout(() => {
      this.isVisible = true;
    }, this.showDelay);
  }

  onMouseLeave(): void {
    this.clearTimeouts();
    this.hideTimeoutId = window.setTimeout(() => {
      this.isVisible = false;
    }, this.hideDelay);
  }

  onFocus(): void {
    if (this.disabled || !this.content) return;
    this.clearTimeouts();
    this.isVisible = true;
  }

  onBlur(): void {
    this.clearTimeouts();
    this.isVisible = false;
  }

  getTooltipClasses(): string {
    const classes = ['tooltip'];
    classes.push(`tooltip-${this.position}`);
    return classes.join(' ');
  }

  private clearTimeouts(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = undefined;
    }
  }
}