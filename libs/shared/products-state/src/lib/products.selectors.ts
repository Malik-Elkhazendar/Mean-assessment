import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './models';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(selectProductsState, (s) => s.products);
export const selectProductsLoading = createSelector(selectProductsState, (s) => s.loading);
export const selectProductsError = createSelector(selectProductsState, (s) => s.error);
export const selectProductsPagination = createSelector(selectProductsState, (s) => s.pagination);
export const selectSelectedProduct = createSelector(selectProductsState, (s) => s.selectedProduct);
export const selectProductsFilters = createSelector(selectProductsState, (s) => s.filters);
