import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.hasAcceptedLegal().then((accepted) => {
    if (!accepted) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  });
};
