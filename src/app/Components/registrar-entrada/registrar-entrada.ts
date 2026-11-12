import { Component, inject, signal, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Alumne, LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import { MenuHeader } from '../menu-header/menu-header';
import { FotoAlumne } from '../foto-alumne/foto-alumne';

const API = 'http://localhost:3000';

@Component({
  imports: [LlistatAlumnesLavabo, MenuHeader, FotoAlumne, RouterLink],
  selector: 'app-registrar-entrada',
  styleUrl: './registrar-entrada.css',
  templateUrl: './registrar-entrada.html',
})
export class RegistrarEntrada {
  private http = inject(HttpClient);
  private llistat = viewChild.required(LlistatAlumnesLavabo);

  idAlumne = signal('');
  professor = signal('');
  error = signal('');
  alumneTrobat = signal<Alumne | null>(null);

  // Si canvia l'ID després de buscar, es torna al botó "Buscar"
  canviId(valor: string) {
    this.idAlumne.set(valor);
    this.alumneTrobat.set(null);
    this.error.set('');
  }

  buscar() {
    const id = this.idAlumne().trim();
    if (!id) {
      this.error.set('Cal introduir l’ID de l’alumne');
      return;
    }

    this.http.get<Alumne>(`${API}/api/lavabo/alumne/${id}`).subscribe({
      next: alumne => {
        this.alumneTrobat.set(alumne);
        this.error.set('');
      },
      error: err => {
        this.alumneTrobat.set(null);
        this.error.set(err.error?.error ?? 'No s’ha pogut buscar l’alumne');
      }
    });
  }

  registrar() {
    const alumne = this.alumneTrobat();
    if (!alumne) return;

    const professor = this.professor().trim();
    if (!professor) {
      this.error.set('Cal indicar el professor que l’ha deixat sortir');
      return;
    }

    if (!this.llistat().afegir(alumne, professor)) {
      this.error.set('Aquest alumne ja és al lavabo');
      return;
    }

    // Neteja per al següent alumne
    this.idAlumne.set('');
    this.professor.set('');
    this.error.set('');
    this.alumneTrobat.set(null);
  }
}
