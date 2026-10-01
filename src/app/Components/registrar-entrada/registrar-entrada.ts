import { Component } from '@angular/core';
import { LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import { MenuHeader } from '../menu-header/menu-header';
import { FotoAlumne } from '../foto-alumne/foto-alumne';
import {RouterLink} from '@angular/router';

@Component({
  imports: [LlistatAlumnesLavabo, MenuHeader, FotoAlumne, RouterLink],
  selector: 'app-registrar-entrada',
  styleUrl: './registrar-entrada.css',
  templateUrl: './registrar-entrada.html',
})
export class RegistrarEntrada {}
