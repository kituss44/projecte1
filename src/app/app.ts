import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoginInicial} from './Components/login-inicial/login-inicial';
import { MenuHeader } from './Components/menu-header/menu-header';
import {LlistatAlumnesLavabo} from './Components/llistat-alumnes-lavabo/llistat-alumnes-lavabo';

@Component({
  imports: [RouterOutlet, LoginInicial, MenuHeader, LlistatAlumnesLavabo],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('projecte1');
}
