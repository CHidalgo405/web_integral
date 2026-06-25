import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  { path: 'confirmation', loadComponent: () => import('./order-confirmation/order-confirmation').then(m => m.OrderConfirmation) },
  { path: 'error', loadComponent: () => import('./order-error/order-error').then(m => m.OrderError) },
  { path: 'history', loadComponent: () => import('./order-history/order-history').then(m => m.OrderHistory) },
  { path: ':id', loadComponent: () => import('./order-detail/order-detail').then(m => m.OrderDetail) },
];
