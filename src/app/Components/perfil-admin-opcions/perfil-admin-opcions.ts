import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-perfil-admin-opcions',
  styleUrl: './perfil-admin-opcions.css',
  templateUrl: './perfil-admin-opcions.html',
})
export class PerfilAdminOpcions {}
