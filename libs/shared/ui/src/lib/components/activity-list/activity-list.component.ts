import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ActivityListItem {
  title: string;
  description: string;
  timestamp: Date | string;
  icon?: string;
}

@Component({
  selector: 'ui-activity-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent {
  @Input() title = 'Recent Activity';
  @Input() activities: ActivityListItem[] = [];

  formatTime(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Today';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    }
  }

  trackByActivity(index: number, activity: ActivityListItem): string {
    return activity.title + activity.timestamp + index;
  }
}