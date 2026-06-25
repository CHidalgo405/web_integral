import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: ':id', loadComponent: () => import('./product-detail/product-detail').then(m => m.ProductDetail) },
  { path: ':id/gallery', loadComponent: () => import('./product-gallery/product-gallery').then(m => m.ProductGallery) },
  { path: ':id/reviews', loadComponent: () => import('./product-reviews/product-reviews').then(m => m.ProductReviews) },
];
