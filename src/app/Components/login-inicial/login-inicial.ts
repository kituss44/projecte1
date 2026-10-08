import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  imports: [FormsModule],
  selector: 'app-login-inicial',
  styleUrl: './login-inicial.css',
  templateUrl: './login-inicial.html',
})

export class LoginInicial {
  private url = 'http://localhost:3000/api/login';

  correu = '';
  password = '';
  error = signal('');

  constructor(private http: HttpClient, private router: Router) {}

  iniciarSessio() {
    this.error.set('');

    if (!this.correu || !this.password) {
      this.error.set('Omple tots els camps');
      return;
    }

    this.http.post<any>(this.url, { correu: this.correu, password: this.password }).subscribe({
      next: (usuari) => {
        sessionStorage.setItem('usuari', JSON.stringify(usuari));

        if (usuari.admin) {
          this.router.navigate(['/perfiladmin']);
        } else {
          this.router.navigate(['/perfil']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.error || 'No s\'ha pogut iniciar sessió');
      }
    });
  }
}
