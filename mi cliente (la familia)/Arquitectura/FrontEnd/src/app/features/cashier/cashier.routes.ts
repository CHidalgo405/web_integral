import { Routes } from '@angular/router';

export const CASHIER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/cashier-layout').then((m) => m.CashierLayout),
    children: [
      { path: '', redirectTo: 'register', pathMatch: 'full' },
      { path: 'register', loadComponent: () => import('./register/cashier-register').then((m) => m.CashierRegister) },
      { path: 'sales', loadComponent: () => import('./sales/cashier-sales').then((m) => m.CashierSales) },
    ],
  },
];
