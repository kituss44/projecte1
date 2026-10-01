import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';
import { FotoAlumne } from '../foto-alumne/foto-alumne';
import { LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';

@Component({
  imports: [MenuHeader, RouterLink, FotoAlumne, LlistatAlumnesLavabo],
  selector: 'app-modificar-alumnes',
  styleUrl: './modificar-alumnes.css',
  templateUrl: './modificar-alumnes.html',
})
export class ModificarAlumnes {}
