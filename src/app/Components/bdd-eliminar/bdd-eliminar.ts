import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import {RouterLink} from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-bdd-eliminar',
  styleUrl: './bdd-eliminar.css',
  templateUrl: './bdd-eliminar.html',
})
export class BddEliminar {}
