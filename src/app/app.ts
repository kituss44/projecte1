import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoginInicial} from './Components/login-inicial/login-inicial';
import { MenuHeader } from './Components/menu-header/menu-header';
import { PerfilProfessor } from './Components/perfil-professor/perfil-professor';

@Component({
  imports: [RouterOutlet, MenuHeader, LoginInicial, PerfilProfessor],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('projecte1');
}
