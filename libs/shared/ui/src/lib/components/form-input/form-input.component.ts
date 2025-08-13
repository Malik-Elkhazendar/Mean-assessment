import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
export type InputAppearance = 'fill' | 'outline';

@Component({
  selector: 'ui-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ],
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() ariaLabel?: string;
  @Input() hint?: string;
  @Input() type: InputType = 'text';
  @Input() appearance: InputAppearance = 'outline';
  @Input() prefixIcon?: string;
  // Backward-compat alias for older templates
  @Input('icon') set legacyIcon(icon: string | undefined) { this.prefixIcon = icon; }
  @Input() suffixIcon?: string;
  @Input() clearable = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() autocomplete?: string;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() pattern?: string | RegExp;
  @Input() patternErrorMessage?: string;
  @Input() customErrorMessage?: string;
  @Input() formControl!: FormControl;
  // Backward-compat alias for older templates
  @Input('control') set legacyControl(ctrl: AbstractControl | null | undefined) { 
    this.formControl = ctrl as FormControl; 
  }
  // Optional custom error message passthrough
  @Input() error?: string;
  // Textarea rows support
  @Input() rows?: number;
  // Backward-compat value binding
  @Input('value') set externalValue(v: string | undefined) {
    if (v !== undefined && v !== this.value) {
      this.value = v ?? '';
    }
  }

  @Output() inputChange = new EventEmitter<string>();
  // Backward-compat output
  @Output() valueChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<Event>();
  @Output() inputBlur = new EventEmitter<Event>();

  value = '';
  showPassword = false;
  
  private onChange: (value: string) => void = () => { /* ControlValueAccessor callback */ };
  private onTouched = () => { /* ControlValueAccessor callback */ };

  get currentInputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get hasErrors(): boolean {
    return !!(this.formControl?.invalid && (this.formControl?.dirty || this.formControl?.touched));
  }

  /**
   * Coerces the optional pattern input to an attribute-safe string or null.
   * - When a RegExp is provided, returns its source (without leading/trailing slashes)
   * - When undefined, returns null so the attribute is not rendered
   */
  get patternAttr(): string | null {
    const currentPattern = this.pattern;
    if (!currentPattern) {
      return null;
    }
    return typeof currentPattern === 'string' ? currentPattern : currentPattern.source;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearValue(): void {
    this.value = '';
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  getFirstErrorKey(): string | null {
    if (!this.formControl?.errors) return null;
    return Object.keys(this.formControl.errors)[0];
  }

  getErrorValue(errorKey: string): unknown {
    return this.formControl?.errors?.[errorKey];
  }

  getMinLengthError(): number {
    const error = this.formControl?.errors?.['minlength'];
    return error?.requiredLength || 0;
  }

  getMaxLengthError(): number {
    const error = this.formControl?.errors?.['maxlength'];
    return error?.requiredLength || 0;
  }

  getMinError(): number {
    const error = this.formControl?.errors?.['min'];
    return error?.min || 0;
  }

  getMaxError(): number {
    const error = this.formControl?.errors?.['max'];
    return error?.max || 0;
  }
}