import { Component } from '@angular/core';
import { LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import { MenuHeader } from '../menu-header/menu-header';
import { FotoAlumne } from '../foto-alumne/foto-alumne';

@Component({
  imports: [LlistatAlumnesLavabo, MenuHeader, FotoAlumne],
  selector: 'app-registrar-entrada',
  styleUrl: './registrar-entrada.css',
  templateUrl: './registrar-entrada.html',
})
export class RegistrarEntrada {}
