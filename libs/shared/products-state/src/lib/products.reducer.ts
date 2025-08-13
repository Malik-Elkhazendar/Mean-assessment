import { createReducer, on } from '@ngrx/store';
import * as ProductsActions from './products.actions';
import { ProductsState } from './models';

export const initialProductsState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},
};

export const productsReducer = createReducer(
  initialProductsState,
  on(ProductsActions.loadProducts, (state, { params }) => ({ ...state, loading: true, error: null, filters: { ...params } })),
  on(ProductsActions.loadProductsSuccess, (state, { products, pagination }) => ({ ...state, loading: false, products, pagination })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.loadProduct, (state) => ({ ...state, loading: true, error: null })),
  on(ProductsActions.loadProductSuccess, (state, { product }) => ({ ...state, loading: false, selectedProduct: product })),
  on(ProductsActions.loadProductFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.createProduct, (state) => ({ ...state, loading: true, error: null })),
  on(ProductsActions.createProductSuccess, (state, { product }) => ({ ...state, loading: false, products: [product, ...state.products] })),
  on(ProductsActions.createProductFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.updateProduct, (state) => ({ ...state, loading: true, error: null })),
  on(ProductsActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    loading: false,
    products: state.products.map(p => (p.id === product.id ? product : p)),
    selectedProduct: state.selectedProduct?.id === product.id ? product : state.selectedProduct,
  })),
  on(ProductsActions.updateProductFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.deleteProduct, (state) => ({ ...state, loading: true, error: null })),
  on(ProductsActions.deleteProductSuccess, (state, { id }) => ({ ...state, loading: false, products: state.products.filter(p => p.id !== id) })),
  on(ProductsActions.deleteProductFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
