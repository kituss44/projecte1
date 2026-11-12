import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuHeader } from '../menu-header/menu-header';
import { computed } from '@angular/core';

interface Alumno {
  idAlumne: number;
  idIeduca: string;
  nom: string;
  cognom1: string | null;
  cognom2: string | null;
  codiGrupMatriculat: string | null;
}

interface Salida {
  dataEntrada: string;
  dataSortida: string | null;
  durada: number | null;
  professor: string | null;
  idAlumne?: number;
  idIeduca?: string;
  nom?: string;
  cognom1?: string | null;
  cognom2?: string | null;
  codiGrupMatriculat?: string | null;
}

interface RespuestaSalidas {
  alumne: Alumno;
  sortides: Salida[];
  tempsMitja: number | null;
  total: number;
}

interface RespuestaLlista {
  data?: string;
  grup?: string;
  professor?: string;
  desde?: string;
  fins?: string;
  sortides: Salida[];
  tempsMitja: number | null;
  total: number;
}

type Modo = 'alumne' | 'data' | 'grup' | 'professor' | 'interval';

@Component({
  imports: [MenuHeader, DatePipe],
  selector: 'app-consultar-vista',
  styleUrl: './consultar-vista.css',
  templateUrl: './consultar-vista.html',
})
export class ConsultarVista {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  mostraAlumneAFila = computed(() => this.modo() !== 'alumne');

  private readonly apiUrl = 'http://localhost:3000/api/alumnes';

  modo = signal<Modo>('alumne');
  alumno = signal<Alumno | null>(null);
  salidas = signal<Salida[]>([]);
  tiempoMedio = signal<number | null>(null);
  total = signal(0);
  cargando = signal(true);
  error = signal('');

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const data = params.get('data');
        const grup = params.get('grup');
        const professor = params.get('professor');
        const desde = params.get('desde');
        const fins = params.get('fins');

        if (data) {
          this.cargarLlista('data', 'sortides-per-data', { data });
        } else if (grup) {
          this.cargarLlista('grup', 'sortides-per-grup', { grup });
        } else if (professor) {
          this.cargarLlista('professor', 'sortides-per-professor', { professor });
        } else if (desde && fins) {                                                   // nou
          this.cargarLlista('interval', 'sortides-per-interval', { desde, fins });
        } else {
          this.cargarAlumne(params.get('idAlumne'), params.get('idIeduca'));
        }
      });
  }

  private cargarLlista(
    modo: 'data' | 'grup' | 'professor' | 'interval',
    endpoint: string,
    params: Record<string, string>
  ): void {
    this.modo.set(modo);
    this.alumno.set(null);
    this.cargando.set(true);
    this.error.set('');

    this.http
      .get<RespuestaLlista>(`${this.apiUrl}/${endpoint}`, { params })
      .subscribe({
        next: (respuesta) => {
          this.salidas.set(respuesta.sortides);
          this.tiempoMedio.set(respuesta.tempsMitja);
          this.total.set(respuesta.total);
          this.cargando.set(false);
        },
        error: (error) => {
          this.salidas.set([]);
          this.tiempoMedio.set(null);
          this.total.set(0);
          this.error.set(error.error?.error || 'No s’han pogut carregar les sortides.');
          this.cargando.set(false);
          console.error(error);
        }
      });
  }

  private cargarAlumne(idAlumne: string | null, idIeduca: string | null): void {
    this.modo.set('alumne');

    if (!idAlumne && !idIeduca) {
      this.cargando.set(false);
      this.error.set('No s’ha indicat cap alumne.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const params: Record<string, string> = idAlumne
      ? { idAlumne }
      : { idIeduca: idIeduca as string };

    this.http
      .get<RespuestaSalidas>(`${this.apiUrl}/sortides`, { params })
      .subscribe({
        next: (respuesta) => {
          this.alumno.set(respuesta.alumne);
          this.salidas.set(respuesta.sortides);
          this.tiempoMedio.set(respuesta.tempsMitja);
          this.total.set(respuesta.total);
          this.cargando.set(false);
        },
        error: (error) => {
          this.alumno.set(null);
          this.salidas.set([]);
          this.tiempoMedio.set(null);
          this.total.set(0);
          this.error.set(error.error?.error || 'No s’han pogut carregar les sortides.');
          this.cargando.set(false);
          console.error(error);
        }
      });
  }
}
