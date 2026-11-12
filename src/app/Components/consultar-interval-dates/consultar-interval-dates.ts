import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-consultar-interval-dates',
  styleUrl: './consultar-interval-dates.css',
  templateUrl: './consultar-interval-dates.html',
})
export class ConsultarIntervalDates {
  private router = inject(Router);
  error = signal('');

  buscar(
    dia1: string, mes1: string, any1: string,
    dia2: string, mes2: string, any2: string
  ): void {
    const desde = this.aIso(dia1, mes1, any1);
    const fins = this.aIso(dia2, mes2, any2);

    if (!desde || !fins) {
      this.error.set('Introdueix dues dates vàlides (dia, mes i any de 4 xifres)');
      return;
    }

    if (desde > fins) {
      this.error.set('La data inicial no pot ser posterior a la final');
      return;
    }

    this.error.set('');
    this.router.navigate(['/consultarvista'], { queryParams: { desde, fins } });
  }

  private aIso(dia: string, mes: string, any: string): string | null {
    dia = dia.trim();
    mes = mes.trim();
    any = any.trim();

    if (!/^\d{1,2}$/.test(dia) || !/^\d{1,2}$/.test(mes) || !/^\d{4}$/.test(any)) {
      return null;
    }

    const d = Number(dia), m = Number(mes), a = Number(any);
    const data = new Date(a, m - 1, d);

    if (data.getFullYear() !== a || data.getMonth() !== m - 1 || data.getDate() !== d) {
      return null;
    }

    return `${any}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
}
