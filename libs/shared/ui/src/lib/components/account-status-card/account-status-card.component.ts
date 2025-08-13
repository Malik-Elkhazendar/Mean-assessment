import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-account-status-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './account-status-card.component.html',
  styleUrls: ['./account-status-card.component.scss']
})
export class AccountStatusCardComponent {
  @Input() accountType?: string;
  @Input() memberSince?: Date | string;
  @Input() status?: string;
  @Input() email?: string;
  @Input() name?: string;
  @Input() sessionExpiresIn?: string | null;

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Not available';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Not available';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }
}