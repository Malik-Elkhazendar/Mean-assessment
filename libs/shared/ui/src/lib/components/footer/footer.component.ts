/**
 * Simple Footer Component
 * 
 * A minimal, modern footer that displays:
 * - Copyright information
 * - Technology stack badges
 * - Responsive design that doesn't overwhelm the page
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOOTER_CONFIG } from '@mean-assessment/constants';

@Component({
  selector: 'ui-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  readonly footerConfig = FOOTER_CONFIG;
  
  trackByTech(index: number, tech: string): string {
    return tech;
  }
}