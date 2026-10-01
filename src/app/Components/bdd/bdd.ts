import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-bdd',
  styleUrl: './bdd.css',
  templateUrl: './bdd.html',
})
export class Bdd {}
