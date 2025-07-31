import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  console.log('authGuard called');
  return !!auth.getCurrentUser() ? true : router.createUrlTree(['/login']);
  // return !!auth.getCurrentUser() ? true : true;
};
