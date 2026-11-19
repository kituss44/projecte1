import { Component, OnDestroy, signal } from '@angular/core';
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
  selector: 'app-modificar-eliminar-alumne',
  styleUrl: './modificar-eliminar-alumne.css',
  templateUrl: './modificar-eliminar-alumne.html',
})
export class ModificarEliminarAlumne implements OnDestroy {
  idAlumne = '';
  private idTrobat = '';
  form = formBuit();

  trobat = signal(false);
  imatge = signal<string | null>(null);

  confirmant = signal(false);   // el botó està demanant confirmació
  esperant = signal(false);     // els 1,5 s d'espera abans de poder confirmar
  private temporitzador: ReturnType<typeof setTimeout> | null = null;

  missatge = signal('');
  esError = signal(false);
  carregant = signal(false);

  constructor(private http: HttpClient) {}

  ngOnDestroy() {
    this.cancelarConfirmacio();
  }

  cancelarConfirmacio() {
    if (this.temporitzador) clearTimeout(this.temporitzador);
    this.temporitzador = null;
    this.confirmant.set(false);
    this.esperant.set(false);
  }

  private avis(text: string, error = false) {
    this.missatge.set(text);
    this.esError.set(error);
  }

  private reiniciar() {
    this.cancelarConfirmacio();
    this.trobat.set(false);
    this.idTrobat = '';
    this.form = formBuit();
    this.imatge.set(null);
  }

  // Si l'usuari canvia l'id després de buscar, cal tornar a buscar
  idCanviat() {
    if (this.trobat()) this.reiniciar();
    this.missatge.set('');
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
        this.form = {
          idIeduca: a.idIeduca ?? '',
          nom: a.nom ?? '',
          cognom1: a.cognom1 ?? '',
          cognom2: a.cognom2 ?? '',
          codiGrupMatriculat: a.codiGrupMatriculat ?? '',
          conflictiu: !!a.conflictiu
        };
        this.imatge.set(a.urlImatge ? `${API}${a.urlImatge}?t=${Date.now()}` : null);
        this.cancelarConfirmacio();
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

  eliminar() {
    if (!this.trobat() || this.esperant()) return;

    // Primer clic: demana confirmació i bloqueja el botó 1,5 s
    if (!this.confirmant()) {
      this.confirmant.set(true);
      this.esperant.set(true);
      this.temporitzador = setTimeout(() => this.esperant.set(false), 1500);
      return;
    }

    // Segon clic: elimina de debò
    this.carregant.set(true);
    this.http.delete(`${API}/api/alumnes/${this.idTrobat}`).subscribe({
      next: () => {
        this.carregant.set(false);
        this.reiniciar();
        this.idAlumne = '';
        this.avis('Alumne eliminat correctament');
      },
      error: (e: HttpErrorResponse) => {
        this.carregant.set(false);
        this.cancelarConfirmacio();
        this.avis(e.error?.error ?? 'No s’ha pogut connectar amb el servidor', true);
      }
    });
  }
}
