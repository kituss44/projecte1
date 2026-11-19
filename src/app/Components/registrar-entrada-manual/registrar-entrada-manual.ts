import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';
import { FotoAlumne } from '../foto-alumne/foto-alumne';
import { Alumne, LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';

const API = 'http://localhost:3000';

type Camp = 'nom' | 'cognom1' | 'cognom2' | 'grup' | 'idIeduca';

const CAMPS: Camp[] = ['nom', 'cognom1', 'cognom2', 'grup', 'idIeduca'];

const NOMS_CAMP: Record<Camp, string> = {
  nom: 'Nom',
  cognom1: 'Cognom 1',
  cognom2: 'Cognom 2',
  grup: 'Codi grup matriculat',
  idIeduca: 'Id ieduca'
};

const textsBuits = (): Record<Camp, string> =>
  ({ nom: '', cognom1: '', cognom2: '', grup: '', idIeduca: '' });

const triatsBuits = (): Record<Camp, string | null> =>
  ({ nom: null, cognom1: null, cognom2: null, grup: null, idIeduca: null });

@Component({
  imports: [MenuHeader, FotoAlumne, LlistatAlumnesLavabo, RouterLink, NgTemplateOutlet],
  selector: 'app-registrar-entrada-manual',
  styleUrl: './registrar-entrada-manual.css',
  templateUrl: './registrar-entrada-manual.html',
})
export class RegistrarEntradaManual {
  private http = inject(HttpClient);
  private router = inject(Router);

  text = signal<Record<Camp, string>>(textsBuits());              // el que s'ha escrit
  triat = signal<Record<Camp, string | null>>(triatsBuits());     // només té valor si s'ha clicat al menú
  suggeriments = signal<string[]>([]);
  campObert = signal<Camp | null>(null);
  error = signal('');
  alumneTrobat = signal<Alumne | null>(null);

  private peticio = 0; // per ignorar respostes antigues si s'escriu ràpid

  valorText(camp: Camp): string {
    return this.text()[camp];
  }

  obrirMenu(camp: Camp) {
    this.campObert.set(camp);
    this.carregarSuggeriments(camp);
  }

  canviText(camp: Camp, valor: string) {
    this.text.update(t => ({ ...t, [camp]: valor }));
    this.triat.update(t => ({ ...t, [camp]: null })); // si es modifica, cal tornar a triar
    this.alumneTrobat.set(null);                      // torna al botó "Buscar"
    this.error.set('');
    this.obrirMenu(camp);
  }

  triarValor(camp: Camp, valor: string) {
    this.text.update(t => ({ ...t, [camp]: valor }));
    this.triat.update(t => ({ ...t, [camp]: valor }));
    this.campObert.set(null);
    this.alumneTrobat.set(null);
    this.error.set('');
  }

  // Enter tria el primer suggeriment
  enterCamp(camp: Camp) {
    const primer = this.suggeriments()[0];
    if (this.campObert() === camp && primer) {
      this.triarValor(camp, primer);
    }
  }

  private carregarSuggeriments(camp: Camp) {
    const num = ++this.peticio;

    // Els altres camps ja triats filtren els suggeriments
    let params = new HttpParams()
      .set('camp', camp)
      .set('text', this.text()[camp].trim());
    for (const c of CAMPS) {
      const valor = this.triat()[c];
      if (c !== camp && valor) {
        params = params.set(c, valor);
      }
    }

    this.http.get<string[]>(`${API}/api/lavabo/suggeriments`, { params }).subscribe({
      next: valors => { if (num === this.peticio) this.suggeriments.set(valors); },
      error: () => { if (num === this.peticio) this.suggeriments.set([]); }
    });
  }

  buscar() {
    let params = new HttpParams();
    let alMenysUn = false;

    for (const c of CAMPS) {
      if (!this.text()[c].trim()) continue;

      const triat = this.triat()[c];
      if (!triat) {
        this.error.set(`Cal triar “${NOMS_CAMP[c]}” del menú desplegable`);
        return;
      }
      params = params.set(c, triat);
      alMenysUn = true;
    }

    if (!alMenysUn) {
      this.error.set('Cal omplir almenys un camp');
      return;
    }

    this.http.get<Alumne>(`${API}/api/lavabo/cerca`, { params }).subscribe({
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

  // Torna a /inserir amb l'alumne ja carregat (id + foto)
  confirmar() {
    const alumne = this.alumneTrobat();
    if (!alumne) return;
    this.router.navigate(['/inserir'], { state: { alumne } });
  }
}
