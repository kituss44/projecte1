import { Component } from '@angular/core';
import { LlistatAlumnesLavabo } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';

@Component({
  imports: [LlistatAlumnesLavabo],
  selector: 'app-registrar-entrada',
  styleUrl: './registrar-entrada.css',
  templateUrl: './registrar-entrada.html',
})
export class RegistrarEntrada {}
