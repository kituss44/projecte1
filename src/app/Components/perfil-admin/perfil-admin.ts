import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-perfil-admin',
  styleUrl: './perfil-admin.css',
  templateUrl: './perfil-admin.html',
})
export class PerfilAdmin {

  usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');

  constructor(private http: HttpClient, private router: Router) {}

  logout() {
    const dades = { correu: this.usuari?.correu, token: this.usuari?.token };

    const sortir = () => {
      sessionStorage.removeItem('usuari');
      this.router.navigate(['/']);   // canvia-ho pel path del login
    };

    // Surt igualment encara que el servidor falli
    this.http.post('http://localhost:3000/api/logout', dades).subscribe({
      next: sortir,
      error: sortir
    });
  }


}
