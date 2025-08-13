import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Shared UI Components
import { 
  CardComponent, 
  ButtonComponent, 
  FormInputComponent,
  AlertComponent,
  BadgeComponent,
  ModalComponent,
  SkeletonLoaderComponent,
  TooltipComponent,
  StatsGridComponent
} from '@mean-assessment/ui';

// Shared Constants and Types  
import { APP_CONFIG, PRODUCT_UI_TEXT } from '@mean-assessment/constants';
import { Product } from '@mean-assessment/data-models';
import { Store } from '@ngrx/store';
import { ProductsQueryParams } from '@mean-assessment/products-state';
import * as ProductsActions from '@mean-assessment/products-state';
import { selectProducts, selectProductsLoading, selectProductsPagination, selectProductsError } from '@mean-assessment/products-state';



@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    CardComponent,
    ButtonComponent,
    FormInputComponent,
    AlertComponent,
    BadgeComponent,
    ModalComponent,
    SkeletonLoaderComponent,
    TooltipComponent,
    StatsGridComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new BehaviorSubject<string>('');
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  
  // Component state
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Search and pagination
  searchTerm = '';
  currentPage = APP_CONFIG.PAGINATION.DEFAULT_PAGE;
  pageSize = APP_CONFIG.PAGINATION.DEFAULT_LIMIT;
  totalProducts = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPrevPage = false;
  
  // Enhanced filtering
  filterCategory = '';
  filterStock: 'all' | 'inStock' | 'outOfStock' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'price' | 'created' = 'created';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Modal state
  showDeleteModal = false;
  productToDelete: Product | null = null;
  
  // Math reference for template
  Math = Math;
  
  // Expose constants to template
  PRODUCT_UI_TEXT = PRODUCT_UI_TEXT;
  
  // Statistics for dashboard
  get productStats() {
    const inStock = this.products.filter(p => p.inStock && p.quantity > 0).length;
    const outOfStock = this.products.filter(p => !p.inStock || p.quantity === 0).length;
    const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    return [
      {
        title: PRODUCT_UI_TEXT.LIST.STATS.TOTAL_PRODUCTS,
        value: this.totalProducts.toString(),
        icon: 'inventory_2',
        color: 'primary' as const,
        description: PRODUCT_UI_TEXT.LIST.STATS.TOTAL_PRODUCTS_DESC
      },
      {
        title: PRODUCT_UI_TEXT.LIST.STATS.IN_STOCK_COUNT,
        value: inStock.toString(),
        icon: 'check_circle',
        color: 'success' as const,
        description: PRODUCT_UI_TEXT.LIST.STATS.IN_STOCK_DESC
      },
      {
        title: PRODUCT_UI_TEXT.LIST.STATS.OUT_OF_STOCK_COUNT,
        value: outOfStock.toString(),
        icon: 'cancel',
        color: 'warn' as const,
        description: PRODUCT_UI_TEXT.LIST.STATS.OUT_OF_STOCK_DESC
      },
      {
        title: PRODUCT_UI_TEXT.LIST.STATS.INVENTORY_VALUE,
        value: this.formatCurrency(totalValue),
        icon: 'attach_money',
        color: 'teal' as const,
        description: PRODUCT_UI_TEXT.LIST.STATS.INVENTORY_VALUE_DESC
      }
    ];
  }
  
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  ngOnInit(): void {
    this.setupSearchSubscription();
    this.store.select(selectProducts).pipe(takeUntil(this.destroy$)).subscribe(p => { this.products = p; this.cdr.markForCheck(); });
    this.store.select(selectProductsLoading).pipe(takeUntil(this.destroy$)).subscribe(l => { this.isLoading = l; this.cdr.markForCheck(); });
    this.store.select(selectProductsError).pipe(takeUntil(this.destroy$)).subscribe(e => { this.error = e; this.cdr.markForCheck(); });
    this.store.select(selectProductsPagination).pipe(takeUntil(this.destroy$)).subscribe(p => {
      if (p) {
        this.totalProducts = p.total;
        this.totalPages = p.totalPages;
        this.hasNextPage = p.hasNext;
        this.hasPrevPage = p.hasPrev;
      }
      this.cdr.markForCheck();
    });
    this.loadProducts();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(APP_CONFIG.UI.DEBOUNCE_DELAY),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 1; // Reset to first page on search
        this.loadProducts();
      });
  }
  
  private loadProducts(): void {
    const params: ProductsQueryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
    };
    this.store.dispatch(ProductsActions.loadProducts({ params }));
  }
  
  // Event handlers
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }
  
  clearError(): void {
    this.error = null;
  }
  
  // Enhanced filtering methods
  onFilterStockChange(filter: 'all' | 'inStock' | 'outOfStock'): void {
    this.filterStock = filter;
    this.currentPage = 1;
    this.loadProducts();
  }
  
  onCategoryFilterChange(category: string): void {
    this.filterCategory = category;
    this.currentPage = 1;
    this.loadProducts();
  }
  
  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
  
  onSortChange(sortBy: 'name' | 'price' | 'created', order?: 'asc' | 'desc'): void {
    this.sortBy = sortBy;
    if (order) {
      this.sortOrder = order;
    } else {
      // Toggle order if same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    this.currentPage = 1;
    this.loadProducts();
  }
  
  clearAllFilters(): void {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filterStock = 'all';
    this.sortBy = 'created';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.searchSubject.next('');
  }
  
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }
  
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }
  
  // Utility methods
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
  
  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }
  
  getProductActions(product: Product) {
    return [
      { label: PRODUCT_UI_TEXT.LIST.ACTIONS.VIEW, variant: 'text' as const, color: 'teal' as const, handler: () => this.viewProduct(product.id) },
      { label: PRODUCT_UI_TEXT.LIST.ACTIONS.EDIT, variant: 'text' as const, color: 'primary' as const, handler: () => this.editProduct(product.id) },
      { label: PRODUCT_UI_TEXT.LIST.ACTIONS.DELETE, variant: 'text' as const, color: 'warn' as const, handler: () => this.deleteProduct(product.id) }
    ];
  }
  
  private viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }
  
  private editProduct(productId: string): void {
    this.router.navigate(['/products', productId, 'edit']);
  }
  
  private deleteProduct(productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.productToDelete = product;
      this.showDeleteModal = true;
    }
  }

  confirmDelete(): void {
    if (this.productToDelete) {
      const deletingId = this.productToDelete.id;
      this.store.dispatch(ProductsActions.deleteProduct({ id: deletingId }));
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }
  
  // Computed properties - use the pagination data from API response
  get hasPreviousPage(): boolean {
    return this.hasPrevPage;
  }
  
  get hasNextPageAvailable(): boolean {
    return this.hasNextPage;
  }
  
  // Stats grid removed
}