import { Routes } from '@angular/router';

export const CHECKOUT_ROUTES: Routes = [
  { path: '', redirectTo: 'identify', pathMatch: 'full' },
  { path: 'identify', loadComponent: () => import('./checkout-identify/checkout-identify').then(m => m.CheckoutIdentify) },
  { path: 'address', loadComponent: () => import('./checkout-address/checkout-address').then(m => m.CheckoutAddress) },
  { path: 'address/new', loadComponent: () => import('./address-form/address-form').then(m => m.AddressForm) },
  { path: 'shipping', loadComponent: () => import('./checkout-shipping/checkout-shipping').then(m => m.CheckoutShipping) },
  { path: 'payment', loadComponent: () => import('./checkout-payment/checkout-payment').then(m => m.CheckoutPayment) },
  { path: 'payment/card', redirectTo: 'payment' },
  { path: 'summary', loadComponent: () => import('./checkout-summary/checkout-summary').then(m => m.CheckoutSummary) },
];
