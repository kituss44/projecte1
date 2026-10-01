import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import {RouterLink} from '@angular/router';

@Component({
  imports: [
    MenuHeader,
    RouterLink
  ],
  selector: 'app-perfil-admin-opcions-editar',
  styleUrl: './perfil-admin-opcions-editar.css',
  templateUrl: './perfil-admin-opcions-editar.html',
})
export class PerfilAdminOpcionsEditar {}
