import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-consultar-grup',
  styleUrl: './consultar-grup.css',
  templateUrl: './consultar-grup.html',
})
export class ConsultarGrup {
  private router = inject(Router);
  error = signal('');

  buscar(grup: string): void {
    grup = grup.trim();

    if (!grup) {
      this.error.set('Introdueix el codi del grup');
      return;
    }

    this.error.set('');
    this.router.navigate(['/consultarvista'], { queryParams: { grup } });
  }
}
