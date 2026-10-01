import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import {FotoAlumne} from '../foto-alumne/foto-alumne';
import {LlistatAlumnesLavabo} from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import {RouterLink} from '@angular/router';

@Component({
  imports: [
    MenuHeader,
    FotoAlumne,
    LlistatAlumnesLavabo,
    RouterLink
  ],
  selector: 'app-registrar-entrada-manual',
  styleUrl: './registrar-entrada-manual.css',
  templateUrl: './registrar-entrada-manual.html',
})
export class RegistrarEntradaManual {}
