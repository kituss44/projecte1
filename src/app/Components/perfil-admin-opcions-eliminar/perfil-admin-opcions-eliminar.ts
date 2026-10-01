import { Component } from '@angular/core';
import { MenuHeader } from '../menu-header/menu-header';
import {RouterLink} from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-perfil-admin-opcions-eliminar',
  styleUrl: './perfil-admin-opcions-eliminar.css',
  templateUrl: './perfil-admin-opcions-eliminar.html',
})
export class PerfilAdminOpcionsEliminar {}
