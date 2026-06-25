import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'products', loadComponent: () => import('./products/products').then((m) => m.ProductManager) },
      { path: 'orders', loadComponent: () => import('./orders/orders').then((m) => m.OrderTracker) },
      { path: 'users', loadComponent: () => import('./users/users').then((m) => m.UserDirectory) },
    ],
  },
];
