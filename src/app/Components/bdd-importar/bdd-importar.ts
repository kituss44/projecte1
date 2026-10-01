import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import {RouterLink} from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-bdd-importar',
  styleUrl: './bdd-importar.css',
  templateUrl: './bdd-importar.html',
})
export class BddImportar {}
