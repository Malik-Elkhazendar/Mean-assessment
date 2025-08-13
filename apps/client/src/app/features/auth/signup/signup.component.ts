import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
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
import { SignupDto } from '@mean-assessment/dto';
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
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store<AppState>);
  
  signupForm!: FormGroup;
  
  // NgRx observables
  loading$: Observable<boolean> = this.store.select(selectAuthLoading);
  error$: Observable<string | null> = this.store.select(selectAuthError);
  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  
  
  appName = APP_CONFIG.APP_NAME;
  signUpTitle = AUTH_UI_TEXT.SIGNUP.TITLE;
  signUpSubtitle = AUTH_UI_TEXT.SIGNUP.SUBTITLE;
  loadingMessage = AUTH_UI_TEXT.SIGNUP.LOADING_TEXT;
  firstNameLabel = AUTH_UI_TEXT.SIGNUP.FIRST_NAME_LABEL;
  firstNamePlaceholder = 'Enter your first name';
  lastNameLabel = AUTH_UI_TEXT.SIGNUP.LAST_NAME_LABEL;
  lastNamePlaceholder = 'Enter your last name';
  emailLabel = AUTH_UI_TEXT.SIGNUP.EMAIL_LABEL;
  emailPlaceholder = 'you@example.com';
  passwordLabel = AUTH_UI_TEXT.SIGNUP.PASSWORD_LABEL;
  passwordPlaceholder = AUTH_UI_TEXT.SIGNUP.PASSWORD_PLACEHOLDER;
  confirmPasswordLabel = AUTH_UI_TEXT.RESET_PASSWORD.CONFIRM_PASSWORD_LABEL;
  confirmPasswordPlaceholder = AUTH_UI_TEXT.SIGNUP.PASSWORD_PLACEHOLDER;
  signUpButtonText = AUTH_UI_TEXT.SIGNUP.SUBMIT_BUTTON;
  alreadyHaveAccountText = AUTH_UI_TEXT.SIGNUP.SIGNIN_PROMPT;
  signInLinkText = AUTH_UI_TEXT.SIGNUP.SIGNIN_LINK;
  termsAgreementText = 'By creating an account, you agree to the';
  termsOfServiceText = 'Terms of Service';
  andText = 'and';
  privacyPolicyText = 'Privacy Policy';
  orText = 'or';
  


  ngOnInit(): void {
    this.initializeForm();
    this.setupStoreSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, FormValidators.email()]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), FormValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: FormValidators.passwordMatch('password', 'confirmPassword')
    });
    
    // Debug form state after initialization
    // Form initialized successfully
  }

  private setupStoreSubscriptions(): void {
    // Clear any previous auth errors when component loads
    this.store.dispatch(AuthActions.clearError());

    // Redirect if already authenticated
    this.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
        }
      });
  }


  onSubmit(): void {
    if (this.signupForm && this.signupForm.valid) {
      // Clear any previous errors
      this.store.dispatch(AuthActions.clearError());
      
      const signupData: SignupDto = {
        firstName: this.signupForm.get('firstName')?.value,
        lastName: this.signupForm.get('lastName')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value
      };

      // Dispatch signup action to NgRx store
      this.store.dispatch(AuthActions.signup({ userData: signupData }));
    } else {
      this.markFormGroupTouched();
    }
  }

  onClearError(): void {
    this.store.dispatch(AuthActions.clearError());
  }



  private markFormGroupTouched(): void {
    if (!this.signupForm) return;
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm?.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onSignInClick(): void {
    this.router.navigate(['/auth/login']);
  }

  // Getter methods for template access
  get firstNameControl(): FormControl {
    return this.signupForm?.get('firstName') as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.signupForm?.get('lastName') as FormControl;
  }

  get emailControl(): FormControl {
    return this.signupForm?.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.signupForm?.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.signupForm?.get('confirmPassword') as FormControl;
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    if (!this.signupForm) return false;
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    if (!this.signupForm) return '';
    const field = this.signupForm.get(fieldName);
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
    if (fieldName === 'confirmPassword' && this.signupForm?.errors?.['passwordMismatch']) {
      return VALIDATION_MESSAGES.passwordMismatch;
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
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
}