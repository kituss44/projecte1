import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-menu-header',
  standalone: true,
  styleUrl: './menu-header.css',
  templateUrl: './menu-header.html',
})
export class MenuHeader {}
