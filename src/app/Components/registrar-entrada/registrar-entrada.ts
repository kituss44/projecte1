import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Alumne, LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import { MenuHeader } from '../menu-header/menu-header';
import { FotoAlumne } from '../foto-alumne/foto-alumne';

const API = 'http://localhost:3000';

// Minúscules i sense accents, per comparar el text escrit amb els noms
const normalitza = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

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
  error = signal('');
  alumneTrobat = signal<Alumne | null>(null);

  // --- Professor (desplegable de suggeriments) ---
  professors = signal<string[]>([]);          // tots els professors de la BD
  professor = signal('');                     // text escrit al recuadre
  professorTriat = signal<string | null>(null); // només té valor si s'ha clicat al menú
  menuObert = signal(false);

  suggeriments = computed(() => {
    const text = normalitza(this.professor());
    if (!text) return [];
    return this.professors().filter(p => normalitza(p).includes(text));
  });

  constructor() {
    // Si arribem des de "Buscar manualment" amb un alumne confirmat, ja el deixem carregat
    // (l'id queda escrit i la foto visible; només falta triar el professor)
    const alumne = history.state?.['alumne'] as Alumne | undefined;
    if (alumne) {
      this.alumneTrobat.set(alumne);
      this.idAlumne.set(String(alumne.idAlumne));
    }
  }

  // Cada cop que es fa clic al recuadre es torna a demanar la llista (per veure professors nous)
  carregarProfessors() {
    this.http.get<string[]>(`${API}/api/professors`).subscribe({
      next: noms => this.professors.set(noms),
      error: () => this.error.set('No s’han pogut carregar els professors')
    });
  }

  canviProfessor(valor: string) {
    this.professor.set(valor);
    this.professorTriat.set(null); // si es modifica el text, cal tornar a triar
    this.menuObert.set(true);
    this.error.set('');
  }

  triarProfessor(nom: string) {
    this.professor.set(nom);
    this.professorTriat.set(nom);
    this.menuObert.set(false);
    this.error.set('');
  }

  // Enter tria el primer suggeriment
  enterProfessor() {
    const primer = this.suggeriments()[0];
    if (this.menuObert() && primer) {
      this.triarProfessor(primer);
    }
  }

  // --- Alumne ---

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

    const professor = this.professorTriat();
    if (!professor) {
      this.error.set('Cal triar un professor existent');
      return;
    }

    if (!this.llistat().afegir(alumne, professor)) {
      this.error.set('Aquest alumne ja és al lavabo');
      return;
    }

    // Neteja per al següent alumne
    this.idAlumne.set('');
    this.professor.set('');
    this.professorTriat.set(null);
    this.menuObert.set(false);
    this.error.set('');
    this.alumneTrobat.set(null);
  }
}
