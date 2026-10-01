import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import {RouterLink} from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar',
  styleUrl: './consultar.css',
  templateUrl: './consultar.html',
})
export class Consultar {}
