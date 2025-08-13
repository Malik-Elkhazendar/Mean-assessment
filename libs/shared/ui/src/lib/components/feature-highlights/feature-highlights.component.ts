import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';

export interface FeatureHighlight {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  actionText?: string;
  actionLink?: string;
  actionColor?: 'primary' | 'accent' | 'warn' | 'basic' | 'success' | 'info' | 'teal';
}

@Component({
  selector: 'ui-feature-highlights',
  standalone: true,
  imports: [CommonModule, MatIconModule, ButtonComponent],
  templateUrl: './feature-highlights.component.html',
  styleUrls: ['./feature-highlights.component.scss']
})
export class FeatureHighlightsComponent {
  @Input() title = 'Key Features';
  @Input() features: FeatureHighlight[] = [];

  trackByFeature(index: number, feature: FeatureHighlight): string {
    return feature.title + index;
  }
}