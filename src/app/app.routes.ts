import { Routes } from '@angular/router';
import { ModificarAlumnes } from './Components/modificar-alumnes/modificar-alumnes';
import { PerfilProfessor } from './Components/perfil-professor/perfil-professor';
import { RegistrarEntrada } from './Components/registrar-entrada/registrar-entrada';
import { Consultar } from './Components/consultar/consultar';
import { Bdd } from './Components/bdd/bdd';


export const routes: Routes = [
  { path: 'inserir', component: RegistrarEntrada },
  { path: 'modificar', component: ModificarAlumnes },
  { path: 'consultar', component: Consultar },
  { path: 'bdd', component: Bdd },
  { path: 'perfil', component: PerfilProfessor },
];
