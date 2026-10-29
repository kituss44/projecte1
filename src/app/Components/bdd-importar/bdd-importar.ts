import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-bdd-importar',
  imports: [CommonModule, MenuHeader, RouterLink],
  templateUrl: './bdd-importar.html',
  styleUrl: './bdd-importar.css'
})
export class BddImportar {

  archivoSeleccionado = signal<File | undefined>(undefined);
  cargando = signal(false);
  mensaje = signal('');

  constructor(private http: HttpClient) {}

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const archivo = event.dataTransfer?.files[0];

    if (archivo) {
      this.seleccionarArchivo(archivo);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (archivo) {
      this.seleccionarArchivo(archivo);
    }

    input.value = '';
  }

  seleccionarArchivo(archivo: File): void {
    this.mensaje.set('');

    if (!/\.(xlsx|xls)$/i.test(archivo.name)) {
      this.archivoSeleccionado.set(undefined);
      this.mensaje.set('Selecciona un fitxer Excel (.xlsx o .xls).');
      return;
    }

    this.archivoSeleccionado.set(archivo);
  }

  enviarArchivo(): void {
    const archivo = this.archivoSeleccionado();

    if (archivo === undefined || this.cargando()) {
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    this.cargando.set(true);
    this.mensaje.set('');

    this.http.post<{
      mensaje?: string;
      registrosInsertados?: number;
      error?: string;
    }>('http://localhost:3000/api/importar-csv', formData)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (respuesta) => {
          this.mensaje.set(
            `${respuesta.mensaje}. Registres inserits: ${respuesta.registrosInsertados}`
          );
          this.archivoSeleccionado.set(undefined);
        },
        error: (error) => {
          this.mensaje.set(error.error?.error || 'Error en importar el CSV.');
          console.error(error);
        }
      });
  }
}
