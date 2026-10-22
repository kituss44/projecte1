import { Component, OnInit, inject, signal } from '@angular/core';
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
  error = signal('');

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
    this.http.get<{ columnes: string[]; files: any[] }>(`${this.api}/${nom}`).subscribe({
      next: r => {
        this.columnes.set(r.columnes);
        this.files.set(r.files);
      },
      error: () => this.error.set('Error carregant la taula')
    });
  }

  format(v: any): string {
    if (v === null || v === undefined) return 'NULL';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
}
