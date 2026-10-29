import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-bdd-eliminar',
  styleUrl: './bdd-eliminar.css',
  templateUrl: './bdd-eliminar.html',
})
export class BddEliminar {
  private http = inject(HttpClient);
  private router = inject(Router);

  carregant = signal(false);
  error = signal<string | null>(null);

  eliminar() {
    this.carregant.set(true);
    this.error.set(null);

    const usuari = JSON.parse(sessionStorage.getItem('usuari') ?? '{}');
    const token = usuari.token ?? '';    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .delete('http://localhost:3000/api/db/buidar', { headers })
      .subscribe({
        next: () => {
          this.carregant.set(false);
          this.router.navigate(['/bdd']);
        },
        error: (err) => {
          this.carregant.set(false);
          this.error.set(err.error?.error ?? 'Error del servidor');
        },
      });
  }
}
