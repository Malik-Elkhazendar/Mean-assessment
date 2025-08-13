import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-activity-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent {
  @Input() icon!: string;
  @Input() iconClass?: string;
  @Input() label!: string;
  @Input() value!: string;
  @Input() isStatus = false;

  get iconClasses(): string {
    const classes = ['activity-icon'];
    if (this.iconClass) {
      classes.push(this.iconClass);
    }
    if (this.isStatus) {
      classes.push('status-active');
    }
    return classes.join(' ');
  }

  get valueClasses(): string {
    const classes = ['activity-value'];
    if (this.isStatus) {
      classes.push('status-text');
    }
    return classes.join(' ');
  }
}