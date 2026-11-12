import { Component, input } from '@angular/core';
import { Alumne } from '../llistat-alumnes-lavabo/llistat-alumnes-lavabo';

@Component({
  imports: [],
  selector: 'app-foto-alumne',
  styleUrl: './foto-alumne.css',
  templateUrl: './foto-alumne.html',
})
export class FotoAlumne {
  alumne = input<Alumne | null>(null);
  api = 'http://localhost:3000';
}
