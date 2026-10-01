import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar-grup',
  styleUrl: './consultar-grup.css',
  templateUrl: './consultar-grup.html',
})
export class ConsultarGrup {}
