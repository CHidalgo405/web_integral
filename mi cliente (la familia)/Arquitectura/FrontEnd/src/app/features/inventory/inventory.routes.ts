import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/inventory-layout').then((m) => m.InventoryLayout),
    children: [
      { path: '', redirectTo: 'stock', pathMatch: 'full' },
      { path: 'stock', loadComponent: () => import('./stock/inventory-stock').then((m) => m.InventoryStock) },
      {
        path: 'movements',
        loadComponent: () => import('./movements/inventory-movements').then((m) => m.InventoryMovements),
      },
    ],
  },
];
