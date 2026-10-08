import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const adminGuard: CanActivateChildFn = () => {
  const router = inject(Router);
  const usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');

  if (usuari?.admin) {
    return true;
  }
  // Si és professor, el tornem a la seva pàgina
  return router.createUrlTree([usuari ? '/perfil' : '/']);
};
