import { Route } from '@angular/router';

export const productsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./product-edit/product-edit.component').then(m => m.ProductEditComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
];