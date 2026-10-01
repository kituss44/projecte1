import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar-data',
  styleUrl: './consultar-data.css',
  templateUrl: './consultar-data.html',
})
export class ConsultarData {}
