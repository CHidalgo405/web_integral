import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const HOME_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'categories', loadComponent: () => import('./categories/categories').then(m => m.Categories) },
  { path: 'categories/:id', loadComponent: () => import('./category-detail/category-detail').then(m => m.CategoryDetail) },
  { path: 'search', loadComponent: () => import('./search/search').then(m => m.Search) },
  { path: 'favorites', loadComponent: () => import('./favorites/favorites').then(m => m.Favorites) },
  {
    path: 'notifications',
    canActivate: [adminGuard],
    loadComponent: () => import('./notifications/notifications').then(m => m.Notifications),
  },
];
