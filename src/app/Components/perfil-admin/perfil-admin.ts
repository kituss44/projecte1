import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-perfil-admin',
  styleUrl: './perfil-admin.css',
  templateUrl: './perfil-admin.html',
})
export class PerfilAdmin {}
