import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@mean-assessment/env';
import { API_ROUTES, ERROR_MESSAGES } from '@mean-assessment/constants';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import * as ProductsActions from './products.actions';
import { Product } from '@mean-assessment/data-models';

@Injectable()
export class ProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ROUTES.PRODUCTS.BASE}`;

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(({ params }) => {
        let httpParams = new HttpParams();
        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.category) httpParams = httpParams.set('category', params.category);
        if (params.inStock !== undefined) httpParams = httpParams.set('inStock', params.inStock.toString());

        return this.http.get<{ products: Product[]; pagination: any; timestamp: string }>(this.baseUrl, { params: httpParams }).pipe(
          map(res => ProductsActions.loadProductsSuccess({ products: res.products, pagination: res.pagination })),
          catchError(err => of(ProductsActions.loadProductsFailure({ error: err?.error?.message || ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG })))
        );
      })
    )
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProduct),
      mergeMap(({ id }) =>
        this.http.get<{ product: Product; timestamp: string }>(`${this.baseUrl}/${id}`).pipe(
          map(res => ProductsActions.loadProductSuccess({ product: res.product })),
          catchError(err => of(ProductsActions.loadProductFailure({ error: err?.error?.message || ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG })))
        )
      )
    )
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProduct),
      mergeMap(({ product }) =>
        this.http.post<{ product: Product; message: string; timestamp: string }>(this.baseUrl, product).pipe(
          map(res => ProductsActions.createProductSuccess({ product: res.product })),
          catchError(err => of(ProductsActions.createProductFailure({ error: err?.error?.message || ERROR_MESSAGES.PRODUCT.CREATE_FAILED })))
        )
      )
    )
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.updateProduct),
      mergeMap(({ id, changes }) =>
        this.http.put<{ product: Product; message: string; timestamp: string }>(`${this.baseUrl}/${id}`, changes).pipe(
          map(res => ProductsActions.updateProductSuccess({ product: res.product })),
          catchError(err => of(ProductsActions.updateProductFailure({ error: err?.error?.message || ERROR_MESSAGES.PRODUCT.UPDATE_FAILED })))
        )
      )
    )
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.deleteProduct),
      mergeMap(({ id }) =>
        this.http.delete<{ message: string; timestamp: string }>(`${this.baseUrl}/${id}`).pipe(
          map(() => ProductsActions.deleteProductSuccess({ id })),
          catchError(err => of(ProductsActions.deleteProductFailure({ error: err?.error?.message || ERROR_MESSAGES.PRODUCT.DELETE_FAILED })))
        )
      )
    )
  );

  // UX: after create/update/delete success, you can optionally refresh list or navigate in components via selectors
}
