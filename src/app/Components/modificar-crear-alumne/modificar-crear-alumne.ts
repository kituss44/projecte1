import { Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MenuHeader } from '../menu-header/menu-header';

const API = 'http://localhost:3000';
const MAX_BYTES = 5 * 1024 * 1024;

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
export class ModificarCrearAlumne implements OnDestroy {
  form = formBuit();
  imatge: File | null = null;
  previsualitzacio = signal<string | null>(null);

  missatge = signal('');
  esError = signal(false);
  carregant = signal(false);

  private fitxer = viewChild<ElementRef<HTMLInputElement>>('fitxer');

  constructor(private http: HttpClient) {}

  ngOnDestroy() {
    this.alliberarPrevisualitzacio();
  }

  private avis(text: string, error = false) {
    this.missatge.set(text);
    this.esError.set(error);
  }

  private alliberarPrevisualitzacio() {
    const url = this.previsualitzacio();
    if (url) URL.revokeObjectURL(url);
    this.previsualitzacio.set(null);
  }

  triarImatge(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!/\.jpe?g$/i.test(file.name)) {
      this.avis('Només es permeten imatges .jpg', true);
      input.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      this.avis('La imatge no pot superar els 5 MB', true);
      input.value = '';
      return;
    }

    this.alliberarPrevisualitzacio();
    this.imatge = file;
    this.previsualitzacio.set(URL.createObjectURL(file));
    this.missatge.set('');
  }

  treureImatge() {
    this.alliberarPrevisualitzacio();
    this.imatge = null;
    const input = this.fitxer()?.nativeElement;
    if (input) input.value = '';
  }

  guardar() {
    const f = this.form;
    if (!f.idIeduca.trim() || !f.nom.trim() || !f.codiGrupMatriculat.trim()) {
      this.avis('Falten camps obligatoris: nom, grup i id ieduca', true);
      return;
    }

    const dades = new FormData();
    dades.append('idIeduca', f.idIeduca);
    dades.append('nom', f.nom);
    dades.append('cognom1', f.cognom1);
    dades.append('cognom2', f.cognom2);
    dades.append('codiGrupMatriculat', f.codiGrupMatriculat);
    dades.append('conflictiu', String(f.conflictiu));
    if (this.imatge) dades.append('imatge', this.imatge);

    this.carregant.set(true);
    this.http.post(`${API}/api/alumnes`, dades).subscribe({
      next: () => {
        this.carregant.set(false);
        this.missatge.set('');
        this.form = formBuit();
        this.treureImatge();
      },
      error: (e: HttpErrorResponse) => {
        this.carregant.set(false);
        this.avis(e.error?.error ?? 'No s’ha pogut connectar amb el servidor', true);
      }
    });
  }
}
