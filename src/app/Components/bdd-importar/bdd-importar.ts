
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bdd-importar',
  imports: [CommonModule, MenuHeader, RouterLink],
  templateUrl: './bdd-importar.html',
  styleUrl: './bdd-importar.css'
})
export class BddImportar {

  archivoSeleccionado: File | undefined = undefined;
  cargando = false;
  mensaje = '';

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
    this.mensaje = '';

    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      this.archivoSeleccionado = undefined;
      this.mensaje = 'Selecciona un fitxer CSV.';
      return;
    }

    this.archivoSeleccionado = archivo;
  }

  enviarArchivo(): void {
    const archivo = this.archivoSeleccionado;

    if (archivo === undefined || this.cargando) {
      return;
    }

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
    ).subscribe({
      next: (respuesta) => {
        this.mensaje =
          `${respuesta.mensaje}. Registres inserits: ` +
          `${respuesta.registrosInsertados}`;

        this.archivoSeleccionado = undefined;
        this.cargando = false;
      },
      error: (error) => {
        this.mensaje =
          error.error?.error || 'Error en importar el CSV.';

        this.cargando = false;
        console.error(error);
      }
    });
  }
}
