import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./profile/profile').then(m => m.Profile) },
  { path: 'addresses', loadComponent: () => import('./addresses/addresses').then(m => m.Addresses) },
  { path: 'payment-methods', loadComponent: () => import('./payment-methods/payment-methods').then(m => m.PaymentMethods) },
  { path: 'help', loadComponent: () => import('./help/help').then(m => m.Help) },
  { path: 'terms', loadComponent: () => import('./terms/terms').then(m => m.Terms) },
  { path: 'edit', loadComponent: () => import('./profile-edit/profile-edit').then(m => m.ProfileEdit) },
];
