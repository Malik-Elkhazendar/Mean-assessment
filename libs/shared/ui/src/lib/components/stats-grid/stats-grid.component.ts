import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-stats-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-grid.component.html',
  styleUrls: ['./stats-grid.component.scss']
})
export class StatsGridComponent {
  @Input() minWidth = '360px';
  @Input() gap = '24px';
  @Input() mobileGap = '16px';

  get gridStyles(): { [key: string]: string } {
    return {
      'display': 'grid',
      'grid-template-columns': `repeat(auto-fit, minmax(${this.minWidth}, 1fr))`,
      'gap': this.gap
    };
  }
}