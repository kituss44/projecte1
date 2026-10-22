import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-bdd-visualitzar',
  styleUrl: './bdd-visualitzar.css',
  templateUrl: './bdd-visualitzar.html',
})
export class BddVisualitzar implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api/db/taules';

  taules = signal<string[]>([]);
  taulaActual = signal('');
  columnes = signal<string[]>([]);
  files = signal<any[]>([]);
  pk = signal<string[]>([]);
  error = signal('');
  editant = signal(false);

  cerca = signal('');
  columnaCerca = signal('');

  filesFiltrades = computed(() => {
    const text = this.normalitza(this.cerca());
    const col = this.columnaCerca();
    const indexades = this.files().map((fila, i) => ({ fila, i }));

    if (!text) return indexades;

    return indexades.filter(({ fila }) => {
      const cols = col ? [col] : this.columnes();
      return cols.some(c => this.normalitza(this.format(fila[c])).includes(text));
    });
  });

  private canvis: Record<number, Record<string, string>> = {};

  ngOnInit() {
    this.http.get<string[]>(this.api).subscribe({
      next: t => {
        this.taules.set(t);
        if (t.length) this.seleccionar(t[0]);
      },
      error: () => this.error.set("No s'han pogut carregar les taules")
    });
  }

  seleccionar(nom: string) {
    this.taulaActual.set(nom);
    this.error.set('');
    this.editant.set(false);
    this.cerca.set('');
    this.columnaCerca.set('');
    this.canvis = {};
    this.http.get<{ columnes: string[]; files: any[]; pk: string[] }>(`${this.api}/${nom}`).subscribe({
      next: r => {
        this.columnes.set(r.columnes);
        this.files.set(r.files);
        this.pk.set(r.pk);
      },
      error: () => this.error.set('Error carregant la taula')
    });
  }

  format(v: any): string {
    if (v === null || v === undefined) return 'NULL';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }

  private normalitza(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  editar() {
    this.canvis = {};
    this.editant.set(true);
  }

  cancelar() {
    this.canvis = {};
    this.editant.set(false);
  }

  editable(col: string, valor: any): boolean {
    return !this.pk().includes(col) && (valor === null || typeof valor !== 'object');
  }

  valorEditat(i: number, col: string, original: any): string {
    return this.canvis[i]?.[col] ?? this.format(original);
  }

  canvia(i: number, col: string, valor: string) {
    (this.canvis[i] ??= {})[col] = valor;
  }

  guardar() {
    const llista: { pk: Record<string, any>; valors: Record<string, any> }[] = [];

    for (const [idx, cols] of Object.entries(this.canvis)) {
      const fila = this.files()[+idx];
      const valors: Record<string, any> = {};

      for (const [col, nou] of Object.entries(cols)) {
        if (nou !== this.format(fila[col])) {
          valors[col] = nou === 'NULL' ? null : nou;
        }
      }

      if (Object.keys(valors).length) {
        llista.push({
          pk: Object.fromEntries(this.pk().map(k => [k, fila[k]])),
          valors
        });
      }
    }

    if (llista.length === 0) {
      this.cancelar();
      return;
    }

    this.http.put(`${this.api}/${this.taulaActual()}`, { canvis: llista }).subscribe({
      next: () => this.seleccionar(this.taulaActual()),
      error: e => this.error.set(e.error?.error ?? 'Error guardant els canvis')
    });
  }
}
