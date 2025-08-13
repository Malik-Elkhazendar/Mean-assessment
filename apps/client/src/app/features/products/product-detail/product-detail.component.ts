import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  AlertComponent,
  SpinnerComponent,
  BadgeComponent,
  ModalComponent,
  TooltipComponent
} from '@mean-assessment/ui';

// Shared Constants and Types
import { ERROR_MESSAGES } from '@mean-assessment/constants';
import { Product } from '@mean-assessment/data-models';

// NgRx
import { Store } from '@ngrx/store';
import { loadProduct, deleteProduct as deleteProductAction, selectSelectedProduct, selectProductsLoading, selectProductsError } from '@mean-assessment/products-state';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    AlertComponent,
    SpinnerComponent,
    BadgeComponent,
    ModalComponent,
    TooltipComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  
  product: Product | null = null;
  productId: string | null = null;
  isLoading = false;
  error: string | null = null;

  // Modal states
  showDeleteModal = false;
  
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.loadProduct();
    // Subscribe to store for product, loading, error
    this.store.select(selectSelectedProduct).pipe(takeUntil(this.destroy$)).subscribe(p => { this.product = p; });
    this.store.select(selectProductsLoading).pipe(takeUntil(this.destroy$)).subscribe(l => { this.isLoading = !!l; });
    this.store.select(selectProductsError).pipe(takeUntil(this.destroy$)).subscribe(e => { this.error = e; });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadProduct(): void {
    if (!this.productId) {
      this.error = ERROR_MESSAGES.PRODUCT.NOT_FOUND;
      return;
    }
    this.error = null;
    this.store.dispatch(loadProduct({ id: this.productId }));
  }
  
  deleteProduct(): void {
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.product) {
      this.store.dispatch(deleteProductAction({ id: this.product.id }));
      this.router.navigate(['/products']);
    } else {
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }
  
  clearError(): void {
    this.error = null;
  }
  
  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
}