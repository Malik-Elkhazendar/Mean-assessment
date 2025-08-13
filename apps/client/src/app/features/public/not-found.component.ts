import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent
} from '@mean-assessment/ui';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goBack(): void {
    // Use router navigation if history is not available
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}