import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar-professor',
  styleUrl: './consultar-professor.css',
  templateUrl: './consultar-professor.html',
})
export class ConsultarProfessor {}
