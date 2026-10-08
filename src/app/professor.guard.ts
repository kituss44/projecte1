import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const professorGuard: CanActivateChildFn = () => {
  const router = inject(Router);
  const usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');

  if (usuari && !usuari.admin) {
    return true;
  }
  // Si és admin, el tornem a la seva pàgina
  return router.createUrlTree([usuari ? '/perfiladmin' : '/']);
};
