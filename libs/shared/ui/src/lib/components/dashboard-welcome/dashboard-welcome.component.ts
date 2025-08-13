import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'ui-dashboard-welcome',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TooltipComponent],
  templateUrl: './dashboard-welcome.component.html',
  styleUrls: ['./dashboard-welcome.component.scss']
})
export class DashboardWelcomeComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() userFullName?: string;
  @Input() defaultUserName!: string;
  @Input() memberSinceLabel!: string;
  @Input() memberSinceDate?: Date | string;
  @Input() memberSinceTooltip?: string;

  get displayName(): string {
    return this.userFullName || this.defaultUserName;
  }

  get membershipDate(): Date | string | undefined {
    return this.memberSinceDate;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }
}