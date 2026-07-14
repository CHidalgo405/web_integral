import { Routes } from '@angular/router';
import { ownerGuard } from '../../core/guards/owner.guard';

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
      { path: 'supply', loadComponent: () => import('./supply/supply').then((m) => m.AdminSupply) },
      { path: 'expirations', loadComponent: () => import('./expirations/expirations').then((m) => m.AdminExpirations) },
      { path: 'promotions', loadComponent: () => import('./promotions/promotions').then((m) => m.AdminPromotions) },
      { path: 'finance', canActivate: [ownerGuard], loadComponent: () => import('./finance/finance').then((m) => m.AdminFinance) },
      { path: 'settings', canActivate: [ownerGuard], loadComponent: () => import('./settings/settings').then((m) => m.AdminSettings) },
    ],
  },
];
