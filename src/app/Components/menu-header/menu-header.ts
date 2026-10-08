import { Component, signal } from '@angular/core';
import { RouterLink} from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-menu-header',
  standalone: true,
  styleUrl: './menu-header.css',
  templateUrl: './menu-header.html',
})
export class MenuHeader {
  usuari = JSON.parse(sessionStorage.getItem('usuari') || 'null');
}
