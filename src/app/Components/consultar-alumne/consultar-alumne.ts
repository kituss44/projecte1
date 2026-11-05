import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-consultar-alumne',
  styleUrl: './consultar-alumne.css',
  templateUrl: './consultar-alumne.html',
})
export class ConsultarAlumne {
  private router = inject(Router);

  buscarPorIdAlumno(valor: string): void {
    this.buscar({ idAlumne: valor.trim() });
  }

  buscarPorIdIeduca(valor: string): void {
    this.buscar({ idIeduca: valor.trim() });
  }

  private buscar(queryParams: { idAlumne?: string; idIeduca?: string }): void {
    const valor = queryParams.idAlumne ?? queryParams.idIeduca;

    if (!valor) {
      return;
    }

    this.router.navigate(['/consultarvista'], { queryParams });
  }
}
