import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

// Shared UI Components
import { 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent,
  SpinnerComponent 
} from '@mean-assessment/ui';

// Shared Constants and DTOs
import { APP_CONFIG, AUTH_UI_TEXT } from '@mean-assessment/constants';
import { LoginDto } from '@mean-assessment/dto';
import { FormValidators, VALIDATION_MESSAGES } from '@mean-assessment/validation';

// Auth NgRx imports
import { 
  AuthActions, 
  AppState, 
  selectAuthLoading, 
  selectAuthError,
  selectIsAuthenticated
} from '@mean-assessment/auth';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    FormInputComponent,
    AlertComponent,
    SpinnerComponent
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store<AppState>);
  
  signinForm!: FormGroup;
  private formSubmitted = false;
  
  // NgRx observables
  loading$: Observable<boolean> = this.store.select(selectAuthLoading);
  error$: Observable<string | null> = this.store.select(selectAuthError);
  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  
  
  appName = APP_CONFIG.APP_NAME;
  signInTitle = AUTH_UI_TEXT.SIGNIN.TITLE;
  signInSubtitle = AUTH_UI_TEXT.SIGNIN.SUBTITLE;
  emailLabel = AUTH_UI_TEXT.SIGNIN.EMAIL_LABEL;
  passwordLabel = AUTH_UI_TEXT.SIGNIN.PASSWORD_LABEL;
  forgotPasswordLink = AUTH_UI_TEXT.SIGNIN.FORGOT_PASSWORD_LINK;
  signInButtonText = AUTH_UI_TEXT.SIGNIN.SUBMIT_BUTTON;
  loadingMessage = AUTH_UI_TEXT.SIGNIN.LOADING_TEXT;
  noAccountText = AUTH_UI_TEXT.SIGNIN.SIGNUP_PROMPT;
  createAccountText = AUTH_UI_TEXT.SIGNIN.SIGNUP_LINK;
  rememberMeLabel = 'Remember me';

  ngOnInit(): void {
    this.initializeForm();
    this.setupStoreSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, FormValidators.email()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  private setupStoreSubscriptions(): void {
    // Clear any previous auth errors when component loads
    this.store.dispatch(AuthActions.clearError());

    // Redirect if already authenticated
    this.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          // Reset form state on successful authentication
          this.formSubmitted = false;
          this.signinForm.reset();
          this.router.navigate(['/dashboard']);
        }
      });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.signinForm.valid) {
      // Clear any previous errors
      this.store.dispatch(AuthActions.clearError());
      
      const loginData: LoginDto = {
        email: this.signinForm.get('email')?.value,
        password: this.signinForm.get('password')?.value
      };

      // Dispatch signin action to NgRx store
      this.store.dispatch(AuthActions.signin({ credentials: loginData }));
    } else {
      this.markFormGroupTouched();
    }
  }

  onClearError(): void {
    this.store.dispatch(AuthActions.clearError());
  }

  onClearAuthError(): void {
    this.store.dispatch(AuthActions.clearError());
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signinForm.controls).forEach(key => {
      const control = this.signinForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private getFormErrors(): { [key: string]: { [key: string]: unknown } | null } {
    const errors: { [key: string]: { [key: string]: unknown } | null } = {};
    Object.keys(this.signinForm.controls).forEach(key => {
      const control = this.signinForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onSignUpClick(): void {
    this.router.navigate(['/auth/signup']);
  }

  onForgotPasswordClick(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  // Getter methods for template access
  get emailControl(): FormControl {
    return this.signinForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.signinForm.get('password') as FormControl;
  }

  get rememberMeControl(): FormControl {
    return this.signinForm.get('rememberMe') as FormControl;
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.signinForm.get(fieldName);
    // Show validation errors when:
    // 1. Field has been touched/interacted with AND field has errors
    // 2. OR form has been submitted (regardless of touch state)
    if (field && field.errors && field.invalid && (field.touched || this.formSubmitted)) {
      if (field.errors['required']) {
        return VALIDATION_MESSAGES.required(fieldName);
      }
      if (field.errors['email']) {
        return VALIDATION_MESSAGES.email;
      }
      if (field.errors['minlength']) {
        return VALIDATION_MESSAGES.minLength(fieldName, field.errors['minlength'].requiredLength);
      }
    }
    return '';
  }
}
