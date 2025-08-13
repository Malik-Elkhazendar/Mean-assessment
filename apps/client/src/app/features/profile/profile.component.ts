import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, ButtonComponent } from '@mean-assessment/ui';
import { PROFILE_UI_TEXT } from '@mean-assessment/constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // UI Text from constants
  readonly profileTitle = PROFILE_UI_TEXT.PROFILE.TITLE;
  readonly profileSubtitle = PROFILE_UI_TEXT.PROFILE.SUBTITLE;
}