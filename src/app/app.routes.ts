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
import { ConsultarGrup } from './Components/consultar-grup/consultar-grup';
import { ConsultarData } from './Components/consultar-data/consultar-data';
import { ConsultarProfessor } from './Components/consultar-professor/consultar-professor';
import { ConsultarIntervalDates } from './Components/consultar-interval-dates/consultar-interval-dates';
import { BddImportar } from './Components/bdd-importar/bdd-importar';
import { BddVisualitzar } from './Components/bdd-visualitzar/bdd-visualitzar';
import { BddEliminar } from './Components/bdd-eliminar/bdd-eliminar';
import {RegistrarEntradaManual} from './Components/registrar-entrada-manual/registrar-entrada-manual';
import { PerfilAdmin } from './Components/perfil-admin/perfil-admin';
import { PerfilAdminOpcions } from './Components/perfil-admin-opcions/perfil-admin-opcions';
import { PerfilAdminOpcionsCrear } from './Components/perfil-admin-opcions-crear/perfil-admin-opcions-crear';
import { PerfilAdminOpcionsAcceptar } from './Components/perfil-admin-opcions-acceptar/perfil-admin-opcions-acceptar';
import { PerfilAdminOpcionsEliminar } from './Components/perfil-admin-opcions-eliminar/perfil-admin-opcions-eliminar';


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
  { path: 'consultaralumne', component: ConsultarAlumne},
  { path: 'consultargrup', component: ConsultarGrup},
  { path: 'consultardata', component: ConsultarData},
  { path: 'consultarprofessor', component: ConsultarProfessor},
  { path: 'consultarinterval', component: ConsultarIntervalDates},
  { path: 'bddimportar', component: BddImportar},
  { path: 'bddvisualitzar', component: BddVisualitzar},
  { path: 'bddeliminar', component: BddEliminar},
  { path: 'inserirManualment', component: RegistrarEntradaManual},
  { path: 'perfiladmin', component: PerfilAdmin},
  { path: 'perfiladminopcions', component: PerfilAdminOpcions},
  { path: 'perfiladminopcionscrear', component: PerfilAdminOpcionsCrear},
  { path: 'perfiladminopcionsaceptar', component: PerfilAdminOpcionsAcceptar},
  { path: 'perfiladminopcionseliminar', component: PerfilAdminOpcionsEliminar},
];
