import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MenuHeader } from '../menu-header/menu-header';

const API = 'http://localhost:3000';

const formBuit = () => ({
  idIeduca: '',
  nom: '',
  cognom1: '',
  cognom2: '',
  codiGrupMatriculat: '',
  conflictiu: false
});

@Component({
  imports: [MenuHeader, FormsModule],
  selector: 'app-modificar-crear-alumne',
  styleUrl: './modificar-crear-alumne.css',
  templateUrl: './modificar-crear-alumne.html',
})
export class ModificarCrearAlumne {
  form = formBuit();
  missatge = signal('');
  esError = signal(false);
  carregant = signal(false);

  constructor(private http: HttpClient) {}

  private avis(text: string, error = false) {
    this.missatge.set(text);
    this.esError.set(error);
  }

  guardar() {
    const f = this.form;
    if (!f.idIeduca.trim() || !f.nom.trim() || !f.codiGrupMatriculat.trim()) {
      this.avis('Falten camps obligatoris: nom, grup i id ieduca', true);
      return;
    }

    this.carregant.set(true);
    this.http.post<{ idAlumne: number }>(`${API}/api/alumnes`, f).subscribe({
      next: () => {
        this.carregant.set(false);
        this.missatge.set('');
        this.form = formBuit();
      },
      error: (e: HttpErrorResponse) => {
        this.carregant.set(false);
        this.avis(e.error?.error ?? 'No s’ha pogut connectar amb el servidor', true);
      }
    });
  }
}
