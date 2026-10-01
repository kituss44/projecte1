import { Component } from '@angular/core';
import {MenuHeader} from '../menu-header/menu-header';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuHeader, RouterLink],
  selector: 'app-consultar-interval-dates',
  styleUrl: './consultar-interval-dates.css',
  templateUrl: './consultar-interval-dates.html',
})
export class ConsultarIntervalDates {}
