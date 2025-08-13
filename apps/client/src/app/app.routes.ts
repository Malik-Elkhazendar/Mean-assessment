import { Route } from '@angular/router';
import { AuthGuard } from '@mean-assessment/auth';
import { PAGE_TITLES } from '@mean-assessment/constants';

export const appRoutes: Route[] = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./features/public/home.component').then(m => m.HomeComponent),
    title: PAGE_TITLES.HOME
  },
  // About page removed
  
  // Authentication routes (lazy loaded for better performance)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/signin/signin.component').then(m => m.SigninComponent),
        title: PAGE_TITLES.SIGNIN
      },
      {
        path: 'signup', 
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
        title: PAGE_TITLES.SIGNUP
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: PAGE_TITLES.FORGOT_PASSWORD
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: PAGE_TITLES.RESET_PASSWORD
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  
  // Protected routes (lazy loaded)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    title: PAGE_TITLES.DASHBOARD,
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [AuthGuard]
  },
  
  // // Admin routes (lazy loaded)
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  //   canActivate: [AuthGuard]
  // },
  
  // Error routes
  {
    path: '404',
    loadComponent: () => import('./features/public/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
