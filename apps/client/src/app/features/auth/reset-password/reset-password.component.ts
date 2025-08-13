import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent,
  SpinnerComponent
} from '@mean-assessment/ui';

// Shared Constants
import { FormValidators, VALIDATION_MESSAGES } from '@mean-assessment/validation';
import { AppState, AuthActions, selectAuthError, selectAuthLoading, selectAuthMessage } from '@mean-assessment/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    FormInputComponent,
    AlertComponent,
    SpinnerComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store<AppState>);
  
  resetForm!: FormGroup;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  successMessage$!: Observable<string | null>;
  resetToken: string | null = null;
  
  ngOnInit(): void {
    this.initializeForm();
    this.getTokenFromUrl();
    this.isLoading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.successMessage$ = this.store.select(selectAuthMessage);
    this.store.dispatch(AuthActions.clearError());
    this.store.dispatch(AuthActions.clearMessage());
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, FormValidators.email()]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), FormValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: FormValidators.passwordMatch('password', 'confirmPassword')
    });
  }
  
  private getTokenFromUrl(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.resetToken = params['token'];
      const emailParam = (params['email'] || '').toString().trim().toLowerCase();
      if (emailParam) {
        this.resetForm.get('email')?.setValue(emailParam);
      }
      if (!this.resetToken) {
        this.store.dispatch(AuthActions.resetPasswordFailure({ error: 'Invalid or missing reset token. Please request a new password reset.' }));
      }
    });
  }
  
  
  onSubmit(): void {
    if (this.resetForm.valid && this.resetToken) {
      const email = this.resetForm.get('email')?.value;
      const password = this.resetForm.get('password')?.value;
      this.store.dispatch(
        AuthActions.resetPassword({ email, resetToken: this.resetToken, newPassword: password })
      );
    } else if (!this.resetToken) {
      this.store.dispatch(
        AuthActions.resetPasswordFailure({ error: 'Invalid reset token. Please request a new password reset.' })
      );
    } else {
      this.markFormGroupTouched();
    }
  }
  
  clearError(): void {
    this.store.dispatch(AuthActions.clearError());
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private getFormErrors(): { [key: string]: { [key: string]: unknown } | null } {
    const errors: { [key: string]: { [key: string]: unknown } | null } = {};
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
  
  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return VALIDATION_MESSAGES.required(this.getFieldDisplayName(fieldName));
      }
      if (field.errors['email']) {
        return VALIDATION_MESSAGES.email;
      }
      if (field.errors['minlength']) {
        return VALIDATION_MESSAGES.minLength(
          this.getFieldDisplayName(fieldName), 
          field.errors['minlength'].requiredLength
        );
      }
      if (field.errors['maxlength']) {
        return VALIDATION_MESSAGES.maxLength(
          this.getFieldDisplayName(fieldName), 
          field.errors['maxlength'].requiredLength
        );
      }
      if (field.errors['passwordStrength']) {
        return VALIDATION_MESSAGES.passwordStrength;
      }
    }
    
    // Check for password mismatch error at form level
    if (fieldName === 'confirmPassword' && this.resetForm?.errors?.['passwordMismatch']) {
      return VALIDATION_MESSAGES.passwordMismatch;
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPasswordStrengthMessage(): string {
    const control = this.passwordControl;
    if (!control || !control.errors?.['passwordStrength']) return '';
    
    const requirements = [];
    const strength = control.errors['passwordStrength'];
    
    if (!strength.hasUpperCase) requirements.push('uppercase letter');
    if (!strength.hasLowerCase) requirements.push('lowercase letter');
    if (!strength.hasNumber) requirements.push('number');
    if (!strength.hasSpecialChar) requirements.push('special character');
    
    return `Password must include: ${requirements.join(', ')}`;
  }
  
  // Getter methods for template access
  get emailControl(): FormControl {
    return this.resetForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.resetForm.get('confirmPassword') as FormControl;
  }
}