import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 
  | 'text' 
  | 'rectangular' 
  | 'circular' 
  | 'rounded' 
  | 'card' 
  | 'list-item' 
  | 'avatar' 
  | 'button'
  | 'form-input'
  | 'product-card'
  | 'dashboard-card';

export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

@Component({
  selector: 'ui-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'rectangular';
  @Input() animation: SkeletonAnimation = 'pulse';
  @Input() width?: string | number;
  @Input() height?: string | number;
  @Input() lines = 1;
  @Input() loading = true;
  @Input() className?: string;
  @Input() count = 1; // Number of skeleton items to repeat

  getSkeletonClasses(): string {
    const classes = ['skeleton'];
    
    classes.push(`skeleton-${this.variant}`);
    classes.push(`skeleton-${this.animation}`);
    
    if (this.className) {
      classes.push(this.className);
    }
    
    return classes.join(' ');
  }

  getSkeletonStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.width) {
      styles['width'] = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }
    
    if (this.height) {
      styles['height'] = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }
    
    return styles;
  }

  getLinesArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}