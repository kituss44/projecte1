import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar-alumne',
  styleUrl: './consultar-alumne.css',
  templateUrl: './consultar-alumne.html',
})
export class ConsultarAlumne {}
