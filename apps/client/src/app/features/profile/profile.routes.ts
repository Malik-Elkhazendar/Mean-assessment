import { Route } from '@angular/router';

export const profileRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'edit',
    loadComponent: () => import('./profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
  },
];