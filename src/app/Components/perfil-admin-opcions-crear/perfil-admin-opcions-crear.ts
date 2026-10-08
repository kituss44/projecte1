import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {MenuHeader} from '../menu-header/menu-header';

@Component({
  imports: [FormsModule, MenuHeader],
  selector: 'app-perfil-admin-opcions-crear',
  styleUrl: './perfil-admin-opcions-crear.css',
  templateUrl: './perfil-admin-opcions-crear.html',
})

export class PerfilAdminOpcionsCrear {
  private url = 'http://localhost:3000/api/usuaris';

  usuari = this.usuariBuit();
  missatge = signal('');
  error = signal(false);

  constructor(private http: HttpClient) {}

  private usuariBuit() {
    return { correu: '', nom: '', cognom: '', password: '', admin: false };
  }

  inserir() {
    this.missatge.set('');
    this.error.set(false);

    if (!this.usuari.correu || !this.usuari.nom || !this.usuari.cognom || !this.usuari.password) {
      this.error.set(true);
      this.missatge.set('Omple tots els camps');
      return;
    }

    this.http.post(this.url, this.usuari).subscribe({
      next: () => {
        this.missatge.set('Usuari creat correctament');
        this.usuari = this.usuariBuit();
      },
      error: (err) => {
        this.error.set(true);
        this.missatge.set(err.error?.error || 'No s\'ha pogut crear l\'usuari');
      }
    });
  }
}
