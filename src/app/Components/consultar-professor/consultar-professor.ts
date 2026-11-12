import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-consultar-professor',
  styleUrl: './consultar-professor.css',
  templateUrl: './consultar-professor.html',
})
export class ConsultarProfessor {
  private router = inject(Router);
  error = signal('');

  buscar(professor: string): void {
    professor = professor.trim();

    if (!professor) {
      this.error.set('Introdueix el nom del professor');
      return;
    }

    this.error.set('');
    this.router.navigate(['/consultarvista'], { queryParams: { professor } });
  }
}
