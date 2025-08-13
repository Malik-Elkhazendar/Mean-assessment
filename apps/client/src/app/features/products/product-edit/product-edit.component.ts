import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent,
  SpinnerComponent 
} from '@mean-assessment/ui';

// Shared Constants
import { ERROR_MESSAGES, APP_CONFIG } from '@mean-assessment/constants';
import { Store } from '@ngrx/store';
import { loadProduct, updateProduct, selectSelectedProduct, selectProductsLoading, selectProductsError } from '@mean-assessment/products-state';

@Component({
  selector: 'app-product-edit',
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
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  
  productForm!: FormGroup;
  productId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.initializeForm();
    this.loadProduct();
    this.store.select(selectSelectedProduct).subscribe(p => {
      if (p) {
        this.productForm.patchValue({
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.quantity ?? 0,
          category: p.category ?? '',
          isActive: p.inStock ?? true,
        });
      }
    });
    this.store.select(selectProductsLoading).subscribe(l => this.isLoading = !!l);
    this.store.select(selectProductsError).subscribe(e => this.error = e);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    const L = APP_CONFIG.PRODUCT.LIMITS;
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(L.NAME_MIN), Validators.maxLength(L.NAME_MAX)]],
      description: ['', [Validators.minLength(L.DESCRIPTION_MIN), Validators.maxLength(L.DESCRIPTION_MAX)]],
      price: [0, [Validators.required, Validators.min(L.PRICE_MIN), Validators.max(L.PRICE_MAX)]],
      stock: [0, [Validators.required, Validators.min(L.QUANTITY_MIN), Validators.max(L.QUANTITY_MAX)]],
      category: ['', [Validators.minLength(L.CATEGORY_MIN), Validators.maxLength(L.CATEGORY_MAX)]],
      isActive: [true],
      trackInventory: [true]
    });
  }
  
  private loadProduct(): void {
    if (!this.productId) {
      this.error = ERROR_MESSAGES.PRODUCT.NOT_FOUND;
      return;
    }
    this.error = null;
    this.store.dispatch(loadProduct({ id: this.productId }));
  }
  
  onSubmit(): void {
    if (this.productForm.valid) {
      this.error = null;
      this.successMessage = null;
      this.isSubmitting = true;
      
      const productData = this.productForm.value as { name: string; description?: string; price: number; stock: number; category?: string; isActive?: boolean };
      this.updateProduct(productData);
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private updateProduct(productData: { name: string; description?: string; price: number; stock: number; category?: string; isActive?: boolean }): void {
    if (!this.productId) return;
    const changes = {
      name: productData.name,
      description: productData.description ?? '',
      price: productData.price,
      quantity: productData.stock,
      category: productData.category ?? '',
    };
    this.store.dispatch(updateProduct({ id: this.productId, changes }));
    this.successMessage = `Product "${changes.name}" has been updated successfully!`;
    this.isSubmitting = false;
    setTimeout(() => this.router.navigate(['/products']), 1200);
  }
  
  deleteProduct(): void {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.isSubmitting = true;
      
   
      setTimeout(() => {
        this.successMessage = 'Product has been deleted successfully!';
        this.isSubmitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 2000);
      }, 1000);
    }
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
  
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD(fieldName);
      }
      if (field.errors['minlength']) {
        return ERROR_MESSAGES.VALIDATION.MIN_LENGTH(fieldName, field.errors['minlength'].requiredLength);
      }
      if (field.errors['maxlength']) {
        return ERROR_MESSAGES.VALIDATION.MAX_LENGTH(fieldName, field.errors['maxlength'].requiredLength);
      }
      if (field.errors['min']) {
        return `${fieldName} must be greater than ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}