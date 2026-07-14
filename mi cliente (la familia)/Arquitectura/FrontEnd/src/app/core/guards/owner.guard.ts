import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ownerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() && auth.user()?.role === 'admin'
    ? true
    : inject(Router).createUrlTree(['/admin/dashboard']);
};
