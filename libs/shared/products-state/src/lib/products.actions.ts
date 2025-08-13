import { createAction, props } from '@ngrx/store';
import { Product } from '@mean-assessment/data-models';
import { ProductsQueryParams } from './models';

export const loadProducts = createAction('[Products] Load Products', props<{ params: ProductsQueryParams }>());
export const loadProductsSuccess = createAction('[Products] Load Products Success', props<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }>());
export const loadProductsFailure = createAction('[Products] Load Products Failure', props<{ error: string }>());

export const loadProduct = createAction('[Products] Load Product', props<{ id: string }>());
export const loadProductSuccess = createAction('[Products] Load Product Success', props<{ product: Product }>());
export const loadProductFailure = createAction('[Products] Load Product Failure', props<{ error: string }>());

export const createProduct = createAction('[Products] Create Product', props<{ product: { name: string; description: string; price: number; quantity: number; category: string; imageUrl?: string } }>());
export const createProductSuccess = createAction('[Products] Create Product Success', props<{ product: Product }>());
export const createProductFailure = createAction('[Products] Create Product Failure', props<{ error: string }>());

export const updateProduct = createAction('[Products] Update Product', props<{ id: string; changes: Partial<Product> }>());
export const updateProductSuccess = createAction('[Products] Update Product Success', props<{ product: Product }>());
export const updateProductFailure = createAction('[Products] Update Product Failure', props<{ error: string }>());

export const deleteProduct = createAction('[Products] Delete Product', props<{ id: string }>());
export const deleteProductSuccess = createAction('[Products] Delete Product Success', props<{ id: string }>());
export const deleteProductFailure = createAction('[Products] Delete Product Failure', props<{ error: string }>());
