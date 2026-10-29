import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MenuHeader } from '../menu-header/menu-header';

interface UsuariNoAdmin {
  userCorreu: string;
  userNom: string;
  userCognom: string;
}

@Component({
  imports: [RouterLink, FormsModule, MenuHeader],
  selector: 'app-bdd-eliminar-usuaris',
  styleUrl: './bdd-eliminar-usuaris.css',
  templateUrl: './bdd-eliminar-usuaris.html',
})
export class BddEliminarUsuaris {  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api/usuaris';

  carregant = signal(false);
  error = signal('');
  exit = signal('');

  mode = signal<'inici' | 'confirmarTots' | 'cercar'>('inici');
  usuaris = signal<UsuariNoAdmin[]>([]);
  cerca = signal('');

  filtrats = computed(() => {
    const q = this.cerca().trim().toLowerCase();
    return this.usuaris().filter(u => u.userCorreu.toLowerCase().includes(q));
  });

  // ⚠️ Adapta-ho a on guardes el token al login
  private headers() {
    const usuari = JSON.parse(sessionStorage.getItem('usuari') ?? '{}');
    const token = usuari.token ?? '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  private netejarMissatges() {
    this.error.set('');
    this.exit.set('');
  }

  // --- Eliminar tots ---
  demanarConfirmacioTots() {
    this.netejarMissatges();
    this.mode.set('confirmarTots');
  }

  async eliminarTots() {
    this.netejarMissatges();
    this.carregant.set(true);
    try {
      const r: any = await firstValueFrom(this.http.delete(`${this.api}/no-admin`, this.headers()));
      this.exit.set(`S'han eliminat ${r.eliminats} usuaris no admin.`);
      this.usuaris.set([]);
      this.mode.set('inici');
    } catch (e: any) {
      this.error.set(e.error?.error ?? 'Error eliminant els usuaris');
    } finally {
      this.carregant.set(false);
    }
  }

  // --- Cercar i eliminar un ---
  async obrirCerca() {
    this.netejarMissatges();
    this.cerca.set('');
    this.mode.set('cercar');
    this.carregant.set(true);
    try {
      const llista = await firstValueFrom(
        this.http.get<UsuariNoAdmin[]>(`${this.api}/no-admin`, this.headers())
      );
      this.usuaris.set(llista);
    } catch (e: any) {
      this.error.set(e.error?.error ?? 'Error carregant els usuaris');
    } finally {
      this.carregant.set(false);
    }
  }

  async eliminarUn(correu: string) {
    if (!confirm(`Segur que vols eliminar ${correu}?`)) return;
    this.netejarMissatges();
    this.carregant.set(true);
    try {
      await firstValueFrom(
        this.http.delete(`${this.api}/${encodeURIComponent(correu)}`, this.headers())
      );
      this.usuaris.update(l => l.filter(u => u.userCorreu !== correu));
      this.exit.set(`Usuari ${correu} eliminat.`);
    } catch (e: any) {
      this.error.set(e.error?.error ?? 'Error eliminant l\'usuari');
    } finally {
      this.carregant.set(false);
    }
  }

  tornar() {
    this.netejarMissatges();
    this.mode.set('inici');
  }
}
