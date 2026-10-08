import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [MenuHeader],
  selector: 'app-perfil-professor',
  styleUrl: './perfil-professor.css',
  templateUrl: './perfil-professor.html',
})
export class PerfilProfessor {

  usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');

  constructor(private http: HttpClient, private router: Router) {}

  logout() {
    const dades = { correu: this.usuari?.correu, token: this.usuari?.token };

    const sortir = () => {
      sessionStorage.removeItem('usuari');
      this.router.navigate(['']);   // canvia-ho pel path del login
    };

    this.http.post('http://localhost:3000/api/logout', dades).subscribe({
      next: sortir,
      error: sortir
    });
  }


}
