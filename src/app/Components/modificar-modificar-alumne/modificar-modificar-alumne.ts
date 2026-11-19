import { Component, ElementRef, OnDestroy, computed, signal, viewChild } from '@angular/core';
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
  selector: 'app-modificar-modificar-alumne',
  styleUrl: './modificar-modificar-alumne.css',
  templateUrl: './modificar-modificar-alumne.html',
})
export class ModificarModificarAlumne implements OnDestroy {
  idAlumne = '';
  private idTrobat = '';
  form = formBuit();

  trobat = signal(false);
  imatge: File | null = null;
  eliminarImatge = false;
  imatgeActual = signal<string | null>(null);        // la que hi ha a la BD
  previsualitzacio = signal<string | null>(null);    // la nova triada
  imatgeMostrada = computed(() => this.previsualitzacio() ?? this.imatgeActual());

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

  private netejarInputFitxer() {
    const input = this.fitxer()?.nativeElement;
    if (input) input.value = '';
  }

  // Si l'usuari canvia l'id després de buscar, cal tornar a buscar
  idCanviat() {
    if (this.trobat()) this.reiniciar();
  }

  private reiniciar() {
    this.trobat.set(false);
    this.idTrobat = '';
    this.form = formBuit();
    this.alliberarPrevisualitzacio();
    this.imatge = null;
    this.eliminarImatge = false;
    this.imatgeActual.set(null);
    this.netejarInputFitxer();
  }

  private omplir(a: any) {
    this.form = {
      idIeduca: a.idIeduca ?? '',
      nom: a.nom ?? '',
      cognom1: a.cognom1 ?? '',
      cognom2: a.cognom2 ?? '',
      codiGrupMatriculat: a.codiGrupMatriculat ?? '',
      conflictiu: !!a.conflictiu
    };
    // ?t= evita que el navegador mostri la foto antiga en memòria cau
    this.imatgeActual.set(a.urlImatge ? `${API}${a.urlImatge}?t=${Date.now()}` : null);
    this.alliberarPrevisualitzacio();
    this.imatge = null;
    this.eliminarImatge = false;
    this.netejarInputFitxer();
  }

  buscar() {
    const id = this.idAlumne.trim();
    if (!/^\d+$/.test(id)) {
      this.reiniciar();
      this.avis('L’ID alumne ha de ser un número', true);
      return;
    }

    this.carregant.set(true);
    this.http.get<any>(`${API}/api/lavabo/alumne/${id}`).subscribe({
      next: a => {
        this.carregant.set(false);
        this.omplir(a);
        this.idTrobat = id;
        this.trobat.set(true);
        this.missatge.set('');
      },
      error: (e: HttpErrorResponse) => {
        this.carregant.set(false);
        this.reiniciar();
        this.avis(e.error?.error ?? 'No s’ha pogut connectar amb el servidor', true);
      }
    });
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
    this.eliminarImatge = false;
    this.previsualitzacio.set(URL.createObjectURL(file));
    this.missatge.set('');
  }

  treureImatge() {
    if (this.imatge) {
      // Descarta la nova i torna a la de la BD (si n'hi ha)
      this.alliberarPrevisualitzacio();
      this.imatge = null;
      this.netejarInputFitxer();
    } else if (this.imatgeActual()) {
      // Marca la imatge de la BD per eliminar-la en modificar
      this.imatgeActual.set(null);
      this.eliminarImatge = true;
    }
  }

  modificar() {
    if (!this.trobat()) return;

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
    dades.append('eliminarImatge', String(this.eliminarImatge));
    if (this.imatge) dades.append('imatge', this.imatge);

    this.carregant.set(true);
    this.http.put<any>(`${API}/api/alumnes/${this.idTrobat}`, dades).subscribe({
      next: a => {
        this.carregant.set(false);
        this.omplir(a);
        this.avis('Alumne modificat correctament');
      },
      error: (e: HttpErrorResponse) => {
        this.carregant.set(false);
        this.avis(e.error?.error ?? 'No s’ha pogut connectar amb el servidor', true);
      }
    });
  }
}
