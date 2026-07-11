import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const cashierGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.user()?.role;

  if (authService.isAuthenticated() && (role === 'cashier' || role === 'admin')) {
    return true;
  }
  return router.createUrlTree([authService.landingRoute()]);
};
