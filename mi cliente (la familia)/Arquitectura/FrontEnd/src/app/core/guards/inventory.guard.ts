import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const inventoryGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.user()?.role;

  if (authService.isAuthenticated() && (role === 'stock' || role === 'admin' || role === 'manager')) {
    return true;
  }

  return router.createUrlTree([authService.landingRoute()]);
};
