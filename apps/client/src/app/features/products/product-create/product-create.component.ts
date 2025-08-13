import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
// Material modules removed in favor of shared ButtonComponent styling

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent,
  SpinnerComponent,
  BadgeComponent
} from '@mean-assessment/ui';

// Shared Constants
import { ERROR_MESSAGES, APP_CONFIG, PRODUCT_UI_TEXT } from '@mean-assessment/constants';

// Product Service
import { Store } from '@ngrx/store';
import { createProduct } from '@mean-assessment/products-state';

// Import CreateProductDto from shared library
import { CreateProductDto } from '@mean-assessment/dto';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    FormInputComponent,
    AlertComponent,
    SpinnerComponent,
    BadgeComponent
  ],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  
  productForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  
  readonly uiText = {
    pageTitle: PRODUCT_UI_TEXT.CREATE.TITLE,
    pageSubtitle: PRODUCT_UI_TEXT.CREATE.SUBTITLE,
    backButtonText: PRODUCT_UI_TEXT.DETAIL.BACK_BUTTON,
    loadingMessage: PRODUCT_UI_TEXT.CREATE.LOADING_TEXT,
    formTitle: PRODUCT_UI_TEXT.CREATE.TITLE,
    formSubtitle: PRODUCT_UI_TEXT.CREATE.SUBTITLE,
    sections: {
      basic: 'Basic Information',
      pricing: 'Pricing & Inventory',
      additional: 'Additional Options',
    },
    fields: {
      name: {
         label: PRODUCT_UI_TEXT.CREATE.NAME_LABEL,
        placeholder: 'Enter product name...',
        tooltip: 'Enter a descriptive name for your product. This will be visible to customers.',
        icon: 'inventory'
      },
      description: {
         label: PRODUCT_UI_TEXT.CREATE.DESCRIPTION_LABEL,
        placeholder: 'Describe your product...',
        tooltip: 'Provide a detailed description of your product. This helps customers understand what you\'re offering.',
        icon: 'description'
      },
      category: {
         label: PRODUCT_UI_TEXT.CREATE.CATEGORY_LABEL,
        placeholder: 'Product category (e.g., Electronics, Clothing)...',
        tooltip: 'Categorize your product to help customers find it more easily.',
        icon: 'category'
      },
      price: {
         label: PRODUCT_UI_TEXT.CREATE.PRICE_LABEL,
        placeholder: '0.00',
        tooltip: 'Set the selling price for your product.',
        icon: 'attach_money'
      },
      quantity: {
         label: PRODUCT_UI_TEXT.CREATE.QUANTITY_LABEL,
        placeholder: '0',
        tooltip: 'Specify how many units of this product you currently have in stock.',
        icon: 'inventory_2'
      },
      imageUrl: {
         label: PRODUCT_UI_TEXT.CREATE.IMAGE_URL_LABEL,
        placeholder: PRODUCT_UI_TEXT.CREATE.IMAGE_URL_PLACEHOLDER,
        tooltip: 'Optional: Add an image URL to showcase your product visually.',
        icon: 'image'
      }
    },
    buttons: {
      cancel: PRODUCT_UI_TEXT.CREATE.CANCEL_BUTTON,
      saveAsDraft: 'Save as Draft',
      createProduct: PRODUCT_UI_TEXT.CREATE.SUBMIT_BUTTON,
    },
    preview: {
      title: 'Product Preview',
      defaultName: 'Product Name',
      defaultPrice: '0.00',
      noDescription: 'No description provided',
      categoryLabel: 'Category:',
      quantityLabel: 'Quantity:',
      statusLabel: 'Status:',
      uncategorized: 'Uncategorized',
      units: 'units',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock'
    },
    validation: {
      draftRequirement: 'Product name and price are required to save as draft'
    },
    success: {
      created: (name: string) => `Product "${name}" has been created successfully!`,
      savedAsDraft: (name: string) => `Product "${name}" has been saved as draft.`
    },
    defaults: {
      draftDescription: 'Draft product - description pending',
      uncategorized: 'Uncategorized'
    }
  };
  
  // Constants from shared config
  readonly appName = APP_CONFIG.APP_NAME;
  readonly debounceDelay = APP_CONFIG.UI.DEBOUNCE_DELAY;
  readonly productLimits = APP_CONFIG.PRODUCT.LIMITS;
  readonly productDefaults = APP_CONFIG.PRODUCT.DEFAULTS;
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    const limits = APP_CONFIG.PRODUCT.LIMITS;
    
    this.productForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(limits.NAME_MIN), 
        Validators.maxLength(limits.NAME_MAX)
      ]],
      description: ['', [
        Validators.required, 
        Validators.minLength(limits.DESCRIPTION_MIN), 
        Validators.maxLength(limits.DESCRIPTION_MAX)
      ]],
      price: [null, [
        Validators.required, 
        Validators.min(limits.PRICE_MIN), 
        Validators.max(limits.PRICE_MAX)
      ]],
      quantity: [APP_CONFIG.PRODUCT.DEFAULTS.QUANTITY, [
        Validators.required, 
        Validators.min(limits.QUANTITY_MIN), 
        Validators.max(limits.QUANTITY_MAX)
      ]],
      category: ['', [
        Validators.required, 
        Validators.minLength(limits.CATEGORY_MIN), 
        Validators.maxLength(limits.CATEGORY_MAX)
      ]],
      imageUrl: ['', [Validators.maxLength(limits.IMAGE_URL_MAX)]]
    });
  }
  
  onSubmit(): void {
    // Form validation complete
    
    if (this.productForm.valid && !this.isSubmitting) {
      this.error = null;
      this.successMessage = null;
      this.isSubmitting = true;
      
      // Prepare product data ensuring proper types
      const formValue = this.productForm.value;
      const productData: CreateProductDto = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        price: Number(formValue.price),
        quantity: Number(formValue.quantity),
        category: formValue.category.trim(),
        imageUrl: formValue.imageUrl?.trim() || undefined
      };
      

      
      this.store.dispatch(createProduct({ product: productData }));
      this.successMessage = this.uiText.success.created(productData.name);
      this.isSubmitting = false;
      this.productForm.reset();
      setTimeout(() => this.router.navigate(['/products']), 1200);
    } else {

      this.markFormGroupTouched();
    }
  }
  
  saveAsDraft(): void {
    // Draft save validation
    
    if (this.productForm.get('name')?.valid && this.productForm.get('price')?.valid && !this.isSubmitting) {
      this.error = null;
      this.successMessage = null;
      this.isSubmitting = true;
      
      // Prepare draft data with defaults for missing fields
      const formValue = this.productForm.value;
      const draftData: CreateProductDto = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || this.uiText.defaults.draftDescription,
        price: Number(formValue.price),
        quantity: Number(formValue.quantity) || 0,
        category: formValue.category?.trim() || this.uiText.defaults.uncategorized,
        imageUrl: formValue.imageUrl?.trim() || undefined
      };
      

      
      this.store.dispatch(createProduct({ product: draftData }));
      this.successMessage = this.uiText.success.savedAsDraft(draftData.name);
      this.isSubmitting = false;
      this.productForm.reset();
      setTimeout(() => this.router.navigate(['/products']), 1200);
    } else {
      this.error = this.uiText.validation.draftRequirement;
    }
  }
  
  onCancel(): void {
    this.router.navigate(['/products']);
  }
  
  isFormValidForDraft(): boolean {
    const nameControl = this.productForm.get('name');
    const priceControl = this.productForm.get('price');
    return !!(nameControl?.valid && priceControl?.valid);
  }
  
  fillValidTestData(): void {
    this.productForm.patchValue({
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 20-hour battery life.',
      category: 'Electronics',
      price: 99.99,
      quantity: 25,
      imageUrl: '' // Leave empty - it's optional
    });
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
  clearError(): void {
    this.error = null;
  }
  
  clearSuccess(): void {
    this.successMessage = null;
  }
  
  // Getter methods for form controls
  get nameControl(): FormControl {
    return this.productForm.get('name') as FormControl;
  }
  
  get descriptionControl(): FormControl {
    return this.productForm.get('description') as FormControl;
  }
  
  get priceControl(): FormControl {
    return this.productForm.get('price') as FormControl;
  }
  
  get quantityControl(): FormControl {
    return this.productForm.get('quantity') as FormControl;
  }
  
  get categoryControl(): FormControl {
    return this.productForm.get('category') as FormControl;
  }
  
  get imageUrlControl(): FormControl {
    return this.productForm.get('imageUrl') as FormControl;
  }
  
  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD(this.getFieldLabel(fieldName));
      }
      if (field.errors['minlength']) {
        return ERROR_MESSAGES.VALIDATION.MIN_LENGTH(this.getFieldLabel(fieldName), field.errors['minlength'].requiredLength);
      }
      if (field.errors['maxlength']) {
        return ERROR_MESSAGES.VALIDATION.MAX_LENGTH(this.getFieldLabel(fieldName), field.errors['maxlength'].requiredLength);
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['max'].max}`;
      }
      if (field.errors['url']) {
        return `Please enter a valid URL`;
      }
    }
    return '';
  }
  
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product name',
      description: 'Description',
      price: 'Price',
      quantity: 'Quantity',
      category: 'Category',
      imageUrl: 'Image URL'
    };
    return labels[fieldName] || fieldName;
  }
}