import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Observable } from 'rxjs';
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
import { APP_CONFIG, AUTH_UI_TEXT } from '@mean-assessment/constants';
import { FormValidators, VALIDATION_MESSAGES } from '@mean-assessment/validation';
import { AppState, AuthActions, selectAuthError, selectAuthLoading, selectAuthMessage } from '@mean-assessment/auth';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store<AppState>);
  
  forgotForm!: FormGroup;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  successMessage$!: Observable<string | null>;

  
  appName = APP_CONFIG.APP_NAME;
  forgotPasswordTitle = AUTH_UI_TEXT.FORGOT_PASSWORD.TITLE;
  forgotPasswordSubtitle = AUTH_UI_TEXT.FORGOT_PASSWORD.SUBTITLE;
  loadingMessage = AUTH_UI_TEXT.FORGOT_PASSWORD.LOADING_TEXT;
  emailLabel = AUTH_UI_TEXT.FORGOT_PASSWORD.EMAIL_LABEL;
  sendResetLinkText = AUTH_UI_TEXT.FORGOT_PASSWORD.SUBMIT_BUTTON;
  backToSignInText = AUTH_UI_TEXT.FORGOT_PASSWORD.BACK_TO_SIGNIN;
  
  ngOnInit(): void {
    this.initializeForm();
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
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, FormValidators.email()]]
    });
  }
  
  onSubmit(): void {
    if (this.forgotForm.valid) {
      const rawEmail = this.forgotForm.get('email')?.value as string;
      const email = (rawEmail || '').toString().trim().toLowerCase();
      this.forgotForm.get('email')?.setValue(email, { emitEvent: false });
      this.store.dispatch(AuthActions.forgotPassword({ email }));
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
  clearError(): void {
    this.store.dispatch(AuthActions.clearError());
  }
  
  getFieldError(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return VALIDATION_MESSAGES.required(this.getFieldDisplayName(fieldName));
      }
      if (field.errors['email']) {
        return VALIDATION_MESSAGES.email;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      email: 'Email'
    };
    return displayNames[fieldName] || fieldName;
  }
  
  // Getter for email control
  get emailControl(): FormControl {
    return this.forgotForm.get('email') as FormControl;
  }
}