import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, finalize, timeout, TimeoutError } from 'rxjs';
import * as XLSX from 'xlsx';

type TipoImportacion = 'alumnos' | 'imagenes' | 'profesores' | 'usuarios';

interface OpcionImportacion {
  tipo: TipoImportacion;
  etiqueta: string;
  descripcion: string;
  titulo: string;
  textoDropzone: string;
  ayudaColumnas: string;
  accept: string;
  extensiones: RegExp;
  mensajeFormato: string;
  disponible: boolean;
  multiple?: boolean;
}

@Component({
  selector: 'app-bdd-importar',
  imports: [CommonModule, MenuHeader, RouterLink],
  templateUrl: './bdd-importar.html',
  styleUrl: './bdd-importar.css'
})
export class BddImportar {

  readonly opciones: OpcionImportacion[] = [
    {
      tipo: 'alumnos',
      etiqueta: 'Alumnes',
      descripcion: 'Llista d\'alumnes',
      titulo: 'Importar alumnes',
      textoDropzone: 'Deixa aquí el teu arxiu .xls/.xlsx',
      ayudaColumnas:
        'El .xls/.xlsx ha de tenir les columnes: idEducacio, nom, cognom1, cognom2 i codiGrupMatricula.',
      accept: '.xlsx,.xls',
      extensiones: /\.(xlsx|xls)$/i,
      mensajeFormato: 'Selecciona un fitxer Excel (.xlsx o .xls).',
      disponible: true
    },
    {
      tipo: 'imagenes',
      etiqueta: 'Imatges d\'alumnes',
      descripcion: 'Fotografies dels alumnes',
      titulo: 'Importar imatges d\'alumnes',
      textoDropzone: 'Deixa aquí els teus arxius .jpg',
      ayudaColumnas:
        'Tria el grup i puja les fotos .jpg: la primera anirà al primer alumne del grup (ordre alfabètic), la segona al segon, etc. Les fotos que sobrin s\'ignoren.',
      accept: '.jpg,.jpeg',
      extensiones: /\.jpe?g$/i,
      mensajeFormato: 'Selecciona només fitxers .jpg.',
      multiple: true,
      disponible: true
    },
    {
      tipo: 'profesores',
      etiqueta: 'Noms dels professors',
      descripcion: 'Nom complet, amb els dos cognoms',
      titulo: 'Importar noms dels professors',
      textoDropzone: 'Deixa aquí el teu arxiu .xls/.xlsx',
      ayudaColumnas:
        'El .xls/.xlsx ha de contenir una columna amb el nom complet del professor',
      accept: '.xlsx,.xls',
      extensiones: /\.(xlsx|xls)$/i,
      mensajeFormato: 'Selecciona un fitxer Excel (.xlsx o .xls).',
      disponible: false
    },
    {
      tipo: 'usuarios',
      etiqueta: 'Usuaris',
      descripcion: 'Comptes per iniciar sessió',
      titulo: 'Importar usuaris',
      textoDropzone: 'Deixa aquí el teu arxiu .xls/.xlsx',
      ayudaColumnas:
        'El .xls/.xlsx ha de contenir: correu, nom, cognoms, password i, admin (1 = admin o 0 = no admin).',
      accept: '.xlsx,.xls',
      extensiones: /\.(xlsx|xls)$/i,
      mensajeFormato: 'Selecciona un fitxer Excel (.xlsx o .xls).',
      disponible: true
    }
  ];

  tipoActual: TipoImportacion = 'alumnos';
  menuAbierto = false;

  archivoSeleccionado: File | undefined = undefined;
  archivosImagenes: File[] = [];
  grupos: string[] = [];
  grupSeleccionat = '';
  cargando = false;
  mensaje = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get opcionActual(): OpcionImportacion {
    return this.opciones.find(o => o.tipo === this.tipoActual) ?? this.opciones[0];
  }

  get puedeEnviar(): boolean {
    if (this.cargando) {
      return false;
    }

    if (this.tipoActual === 'imagenes') {
      return this.archivosImagenes.length > 0 && this.grupSeleccionat !== '';
    }

    return this.archivoSeleccionado !== undefined;
  }

  // ---------- Selector de tipo ----------

  alternarMenu(event: Event): void {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  seleccionarTipo(tipo: TipoImportacion): void {
    if (this.cargando) {
      return;
    }

    this.tipoActual = tipo;
    this.archivoSeleccionado = undefined;
    this.archivosImagenes = [];
    this.mensaje = '';
    this.menuAbierto = false;

    if (tipo === 'imagenes') {
      this.cargarGrupos();
    }
  }

  // ---------- Grups matriculats ----------

  private cargarGrupos(): void {
    this.http.get<string[]>('http://localhost:3000/api/alumnes/grups').subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        if (!grupos.includes(this.grupSeleccionat)) {
          this.grupSeleccionat = '';
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.mensaje = 'No s\'han pogut carregar els grups.';
        console.error(error);
        this.cdr.markForCheck();
      }
    });
  }

  onGrupChange(event: Event): void {
    this.grupSeleccionat = (event.target as HTMLSelectElement).value;
  }

  // ---------- Selección de archivo ----------

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.procesarArchivos(Array.from(event.dataTransfer?.files ?? []));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.procesarArchivos(Array.from(input.files ?? []));
    input.value = '';
  }

  private procesarArchivos(archivos: File[]): void {
    if (archivos.length === 0) {
      return;
    }

    if (!this.opcionActual.multiple) {
      this.seleccionarArchivo(archivos[0]);
      return;
    }

    this.mensaje = '';
    const validos = archivos.filter(a => this.opcionActual.extensiones.test(a.name));

    if (validos.length === 0) {
      this.archivosImagenes = [];
      this.mensaje = this.opcionActual.mensajeFormato;
      return;
    }

    if (validos.length < archivos.length) {
      this.mensaje =
        `S'han descartat ${archivos.length - validos.length} fitxers que no són .jpg.`;
    }

    this.archivosImagenes = validos.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  seleccionarArchivo(archivo: File): void {
    this.mensaje = '';

    if (!this.opcionActual.extensiones.test(archivo.name)) {
      this.archivoSeleccionado = undefined;
      this.mensaje = this.opcionActual.mensajeFormato;
      return;
    }

    this.archivoSeleccionado = archivo;
  }

  // ---------- Envío ----------

  enviarArchivo(): void {
    if (!this.puedeEnviar) {
      return;
    }

    switch (this.tipoActual) {
      case 'alumnos':
        this.importarAlumnos(this.archivoSeleccionado!);
        break;
      case 'imagenes':
        this.importarImagenes();
        break;
      case 'profesores':
        this.importarProfesores(this.archivoSeleccionado!);
        break;
      case 'usuarios':
        this.importarUsuarios(this.archivoSeleccionado!);
        break;
      default:
        break;
    }
  }

  private importarAlumnos(archivo: File): void {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    this.cargando = true;
    this.mensaje = '';

    this.http.post<{
      mensaje?: string;
      registrosInsertados?: number;
      error?: string;
    }>(
      'http://localhost:3000/api/importar-csv',
      formData
    ).pipe(
      timeout(60000),
      finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (respuesta) => {
        this.mensaje =
          `${respuesta.mensaje}. Registres inserits: ` +
          `${respuesta.registrosInsertados}`;

        this.archivoSeleccionado = undefined;
      },
      error: (error) => {
        this.mensaje = error instanceof TimeoutError
          ? 'El servidor no ha respost a temps.'
          : error.error?.error || 'Error en importar l\'Excel.';

        console.error(error);
      }
    });
  }

  private importarImagenes(): void {
    const formData = new FormData();
    formData.append('grup', this.grupSeleccionat);
    this.archivosImagenes.forEach(f => formData.append('imatges', f, f.name));

    this.cargando = true;
    this.mensaje = '';

    this.http.post<{
      mensaje?: string;
      assignades?: number;
      ignorades?: number;
      alumnesSenseFoto?: number;
    }>(
      'http://localhost:3000/api/importar-imatges',
      formData
    ).pipe(
      timeout(120000),
      finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (r) => {
        this.mensaje = `${r.mensaje}. Imatges assignades: ${r.assignades}`;

        if (r.ignorades) {
          this.mensaje += `, ${r.ignorades} sobrants ignorades`;
        }
        if (r.alumnesSenseFoto) {
          this.mensaje += `, ${r.alumnesSenseFoto} alumnes sense foto`;
        }

        this.mensaje += '.';
        this.archivosImagenes = [];
      },
      error: (error) => {
        this.mensaje = error instanceof TimeoutError
          ? 'El servidor no ha respost a temps.'
          : error.error?.error || 'Error en importar les imatges.';

        console.error(error);
      }
    });
  }

  private importarProfesores(archivo: File): void {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    this.cargando = true;
    this.mensaje = '';

    this.http.post<{
      mensaje?: string;
      registrosInsertados?: number;
      duplicados?: number;
      error?: string;
    }>(
      'http://localhost:3000/api/importar-professors',
      formData
    ).pipe(
      timeout(60000),
      finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (respuesta) => {
        this.mensaje =
          `${respuesta.mensaje}. Professors inserits: ` +
          `${respuesta.registrosInsertados}`;

        if (respuesta.duplicados) {
          this.mensaje += `, ${respuesta.duplicados} ja existien`;
        }

        this.mensaje += '.';
        this.archivoSeleccionado = undefined;
      },
      error: (error) => {
        this.mensaje = error instanceof TimeoutError
          ? 'El servidor no ha respost a temps.'
          : error.error?.error || 'Error en importar els professors.';

        console.error(error);
      }
    });
  }

  private async importarUsuarios(archivo: File): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      const buffer = await archivo.arrayBuffer();
      const libro = XLSX.read(buffer, { type: 'array' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const filasRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        hoja,
        { defval: '', raw: false }
      );

      // Quita espacios sobrantes en cabeceras y valores
      const filas = filasRaw.map(fila => {
        const limpia: Record<string, string> = {};
        for (const [clave, valor] of Object.entries(fila)) {
          limpia[clave.trim()] = String(valor ?? '').trim();
        }
        return limpia;
      });

      if (filas.length === 0) {
        this.mensaje = 'L\'Excel no conté registres.';
        return;
      }

      const columnasObligatorias = ['correu', 'nom', 'cognom', 'password'];
      const cabeceras = Object.keys(filas[0]);
      const faltantes = columnasObligatorias.filter(c => !cabeceras.includes(c));

      if (faltantes.length > 0) {
        this.mensaje = `Falten columnes a l'Excel: ${faltantes.join(', ')}.`;
        return;
      }

      let creados = 0;
      let duplicados = 0;
      const filasConError: number[] = [];

      for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];

        try {
          await firstValueFrom(
            this.http.post('http://localhost:3000/api/usuaris', {
              correu: fila['correu'],
              nom: fila['nom'],
              cognom: fila['cognom'],
              password: fila['password'],
              admin: this.esAdmin(fila['admin'])
            }).pipe(timeout(15000))
          );
          creados++;
        } catch (error) {
          if (error instanceof HttpErrorResponse && error.status === 409) {
            duplicados++;
          } else {
            // +2: una fila de cabecera y los índices empiezan en 0
            filasConError.push(i + 2);
            console.error(error);
          }
        }
      }

      this.mensaje =
        `Importació completada: ${creados} usuaris creats, ` +
        `${duplicados} ja existien`;

      if (filasConError.length > 0) {
        this.mensaje +=
          `, ${filasConError.length} amb error (files: ${filasConError.join(', ')})`;
      }

      this.mensaje += '.';
      this.archivoSeleccionado = undefined;

    } catch (error) {
      this.mensaje = 'No s\'ha pogut llegir l\'Excel.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  private esAdmin(valor: string | undefined): boolean {
    const texto = (valor ?? '').trim().toLowerCase();
    return ['1', 'true', 'si', 'sí', 'x', 'admin'].includes(texto);
  }
}
