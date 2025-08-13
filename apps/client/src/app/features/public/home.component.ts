import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { 
  CardComponent, 
  ButtonComponent
} from '@mean-assessment/ui';
import { selectIsAuthenticated, selectUser } from '@mean-assessment/auth';
import { APP_CONFIG } from '@mean-assessment/constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly store = inject(Store);
  
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  user$ = this.store.select(selectUser);
  appName = APP_CONFIG.APP_NAME;

}