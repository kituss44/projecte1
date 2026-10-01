import { Routes } from '@angular/router';
import { ModificarAlumnes } from './Components/modificar-alumnes/modificar-alumnes';
import { PerfilProfessor } from './Components/perfil-professor/perfil-professor';
import { RegistrarEntrada } from './Components/registrar-entrada/registrar-entrada';
import { Consultar } from './Components/consultar/consultar';
import { Bdd } from './Components/bdd/bdd';
import { LoginInicial } from './Components/login-inicial/login-inicial';
import { ModificarCrearAlumne } from './Components/modificar-crear-alumne/modificar-crear-alumne';
import { ModificarModificarAlumne } from './Components/modificar-modificar-alumne/modificar-modificar-alumne';
import { ModificarEliminarAlumne } from './Components/modificar-eliminar-alumne/modificar-eliminar-alumne';
import {ConsultarAlumne} from './Components/consultar-alumne/consultar-alumne';


export const routes: Routes = [
  { path: 'inserir', component: RegistrarEntrada },
  { path: 'modificar', component: ModificarAlumnes },
  { path: 'consultar', component: Consultar },
  { path: 'bdd', component: Bdd },
  { path: 'perfil', component: PerfilProfessor },
  { path: '', component: LoginInicial },
  { path: 'modificarcrear', component: ModificarCrearAlumne},
  { path: 'modificareditar', component: ModificarModificarAlumne},
  { path: 'modificareliminar', component: ModificarEliminarAlumne},
  { path: 'consultaralumne', component: ConsultarAlumne}
];
