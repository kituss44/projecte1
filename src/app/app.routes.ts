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
import { PerfilAdminOpcionsEditar } from './Components/perfil-admin-opcions-editar/perfil-admin-opcions-editar';
import { PerfilAdminOpcionsEliminar } from './Components/perfil-admin-opcions-eliminar/perfil-admin-opcions-eliminar';
import { ConsultarVista } from './Components/consultar-vista/consultar-vista';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { professorGuard } from './professor.guard';


export const routes: Routes = [
  // Pública
  { path: '', component: LoginInicial },

  // Totes les de dins exigeixen sessió vàlida
  {
    path: '',
    canActivateChild: [authGuard],
    children: [

      // Només professors
      {
        path: '',
        canActivateChild: [professorGuard],
        children: [
          { path: 'perfil', component: PerfilProfessor },
          { path: 'inserir', component: RegistrarEntrada },
          { path: 'inserirManualment', component: RegistrarEntradaManual },
        ]
      },

      // Només admins
      {
        path: '',
        canActivateChild: [adminGuard],
        children: [
          { path: 'perfiladmin', component: PerfilAdmin },
          { path: 'perfiladminopcions', component: PerfilAdminOpcions },
          { path: 'perfiladminopcionscrear', component: PerfilAdminOpcionsCrear },
          { path: 'perfiladminopcionseditar', component: PerfilAdminOpcionsEditar },
          { path: 'perfiladminopcionseliminar', component: PerfilAdminOpcionsEliminar },

          { path: 'modificar', component: ModificarAlumnes },
          { path: 'modificarcrear', component: ModificarCrearAlumne },
          { path: 'modificareditar', component: ModificarModificarAlumne },
          { path: 'modificareliminar', component: ModificarEliminarAlumne },

          { path: 'consultar', component: Consultar },
          { path: 'consultaralumne', component: ConsultarAlumne },
          { path: 'consultargrup', component: ConsultarGrup },
          { path: 'consultardata', component: ConsultarData },
          { path: 'consultarprofessor', component: ConsultarProfessor },
          { path: 'consultarinterval', component: ConsultarIntervalDates },
          { path: 'consultarvista', component: ConsultarVista },

          { path: 'bdd', component: Bdd },
          { path: 'bddimportar', component: BddImportar },
          { path: 'bddvisualitzar', component: BddVisualitzar },
          { path: 'bddeliminar', component: BddEliminar },
        ]
      },
    ]
  },

  // Qualsevol altra URL → login
  { path: '**', redirectTo: '' }
];
