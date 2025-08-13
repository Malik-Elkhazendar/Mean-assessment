import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@mean-assessment/constants';
import { environment } from '../../../../environments/environment';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent
} from '@mean-assessment/ui';

// Shared Constants
import { ERROR_MESSAGES } from '@mean-assessment/constants';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    FormInputComponent,
    AlertComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly http = inject(HttpClient);
  
  profileForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    this.profileForm = new FormBuilder().group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }
  
  private loadUserProfile(): void {
    this.isLoading = true;
    this.http.get<{ user: { firstName: string; lastName: string } }>(
      `${environment.apiUrl}${API_ROUTES.USERS.PROFILE_ME}`
    ).subscribe({
      next: (res) => {
        this.profileForm.patchValue(res.user);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG;
      }
    });
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.error = null;
    // Only send fields allowed by UpdateUserDto (firstName, lastName)
    const payload = {
      firstName: this.profileForm.value.firstName?.trim(),
      lastName: this.profileForm.value.lastName?.trim()
    };
    this.http.put<{ message: string; user: unknown }>(
      `${environment.apiUrl}${API_ROUTES.USERS.PROFILE_ME}`,
      payload
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Profile updated successfully!';
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || ERROR_MESSAGES.USER.UPDATE_FAILED || ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG;
      }
    });
  }
  
  clearError(): void {
    this.error = null;
  }
  
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD(fieldName);
      }
      if (field.errors['email']) {
        return ERROR_MESSAGES.VALIDATION.INVALID_EMAIL;
      }
      if (field.errors['minlength']) {
        return ERROR_MESSAGES.VALIDATION.MIN_LENGTH(fieldName, field.errors['minlength'].requiredLength);
      }
    }
    return '';
  }
}