import { Component } from '@angular/core';
import { FotoAlumne } from '../foto-alumne/foto-alumne';
import { LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';
import { MenuHeader } from '../menu-header/menu-header';

@Component({
  imports: [FotoAlumne, LlistatAlumnesLavabo, MenuHeader],
  selector: 'app-modificar-crear-alumne',
  styleUrl: './modificar-crear-alumne.css',
  templateUrl: './modificar-crear-alumne.html',
})
export class ModificarCrearAlumne {}
