import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3000';
const CLAU_STORAGE = 'alumnesAlLavabo';

export interface Alumne {
  idAlumne: number;
  idIeduca: string;
  nom: string;
  cognom1: string | null;
  cognom2: string | null;
  codiGrupMatriculat: string | null;
  urlImatge: string | null;
  conflictiu: number;
}

export interface AlumneAlLavabo {
  alumne: Alumne;
  professor: string;
  dataEntrada: string; // ISO
}

@Component({
  imports: [DatePipe],
  selector: 'app-llistat-alumnes-lavabo',
  styleUrl: './llistat-alumnes-lavabo.css',
  templateUrl: './llistat-alumnes-lavabo.html',
})
export class LlistatAlumnesLavabo implements OnDestroy {
  private http = inject(HttpClient);

  alLavabo = signal<AlumneAlLavabo[]>(this.carregarStorage());
  error = signal('');

  private ara = signal(Date.now());
  private timer = setInterval(() => this.ara.set(Date.now()), 30_000);

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  /** El crida el pare (RegistrarEntrada) quan es clica "Registrar". Retorna false si ja hi era. */
  afegir(alumne: Alumne, professor: string): boolean {
    if (this.alLavabo().some(x => x.alumne.idAlumne === alumne.idAlumne)) {
      return false;
    }
    this.alLavabo.update(llista => [
      ...llista,
      { alumne, professor, dataEntrada: new Date().toISOString() }
    ]);
    this.guardarStorage();
    return true;
  }

  minutsFora(entrada: AlumneAlLavabo): number {
    return Math.max(0, Math.floor((this.ara() - new Date(entrada.dataEntrada).getTime()) / 60000));
  }

  // Clic al nom: l'alumne torna del lavabo, es guarda a la BD i es treu de la llista
  sortir(entrada: AlumneAlLavabo) {
    const cos = {
      idAlumne: entrada.alumne.idAlumne,
      professor: entrada.professor,
      dataEntrada: this.aMysql(new Date(entrada.dataEntrada)),
      dataSortida: this.aMysql(new Date())
    };

    this.http.post(`${API}/api/lavabo/registre`, cos).subscribe({
      next: () => {
        this.alLavabo.update(llista =>
          llista.filter(x => x.alumne.idAlumne !== entrada.alumne.idAlumne));
        this.guardarStorage();
        this.error.set('');
      },
      error: err => this.error.set(err.error?.error ?? 'No s’ha pogut guardar la sortida')
    });
  }

  // ---- helpers ----
  private aMysql(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
      `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  private guardarStorage() {
    localStorage.setItem(CLAU_STORAGE, JSON.stringify(this.alLavabo()));
  }

  private carregarStorage(): AlumneAlLavabo[] {
    try {
      return JSON.parse(localStorage.getItem(CLAU_STORAGE) || '[]');
    } catch {
      return [];
    }
  }
}
