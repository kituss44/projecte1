import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');

  if (!usuari?.token) {
    return router.createUrlTree(['']);   // path del login
  }

  return http.post('http://localhost:3000/api/sessio', {
    correu: usuari.correu,
    token: usuari.token
  }).pipe(
    map(() => true),
    catchError(() => {
      sessionStorage.removeItem('usuari');
      return of(router.createUrlTree(['/']));
    })
  );
};
