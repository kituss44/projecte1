import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-consultar-data',
  styleUrl: './consultar-data.css',
  templateUrl: './consultar-data.html',
})
export class ConsultarData {
  private router = inject(Router);
  error = signal('');

  buscar(dia: string, mes: string, any: string): void {
    dia = dia.trim();
    mes = mes.trim();
    any = any.trim();

    if (!/^\d{1,2}$/.test(dia) || !/^\d{1,2}$/.test(mes) || !/^\d{4}$/.test(any)) {
      this.error.set('Introdueix dia, mes i any (4 xifres) numèrics');
      return;
    }

    const d = Number(dia), m = Number(mes), a = Number(any);
    const data = new Date(a, m - 1, d);

    if (data.getFullYear() !== a || data.getMonth() !== m - 1 || data.getDate() !== d) {
      this.error.set('La data no és vàlida');
      return;
    }

    this.error.set('');
    const iso = `${any}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    this.router.navigate(['/consultarvista'], { queryParams: { data: iso } });
  }
}
