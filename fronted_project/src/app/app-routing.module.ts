import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarUsuariosComponent } from './componentes/editar-usuarios/editar-usuarios.component';
import { ListaUsuariosComponent } from './componentes/lista-usuarios/lista-usuarios.component';
import { IniciarSesionComponent } from './componentes/usuarios/iniciar-sesion/iniciar-sesion.component';
import { RegistrarComponent } from './componentes/usuarios/registrar/registrar.component';
import { SesionesComponent } from './componentes/sesiones/sesiones.component';
import { usuariosGuard } from './guardas/usuarios.guard';  // Corrección del nombre a PascalCase
import { roleGuard } from './guardas/role.guard';         // Corrección del nombre a PascalCase
import { CursosComponent } from './componentes/cursos/cursos.component';
import { SesionesusuarioComponent } from './componentes/sesionesusuario/sesionesusuario.component';
import { PlayerComponent } from './componentes/player/player.component';
import { ActividadesComponent } from './componentes/actividades/actividades.component';
import { ItemsComponent } from './componentes/items/items.component';
import { SubirTareaComponent } from './componentes/subir-tarea/subir-tarea.component';
import { InicioComponent } from './componentes/inicio/inicio.component';

const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'sesionesusuario', component: SesionesusuarioComponent },
  { path: 'actividades', component: ActividadesComponent },
  { path: 'subir-tarea', component: SubirTareaComponent },
  { path: 'player/:id', component: PlayerComponent },

  {
    path: 'cursos',
    component: CursosComponent,
    canActivate: [roleGuard], // Sólo una vez el canActivate con roleGuard
    data: { expectedRole: 'administrador' } // Se puede pasar un array de roles si es necesario
  },
  {
    path: 'items',
    component: ItemsComponent,
    canActivate: [roleGuard], // Sólo una vez el canActivate con roleGuard
    data: { expectedRole: 'administrador' } // Se puede pasar un array de roles si es necesario
  },
  {
    path: 'sesiones',
    component: SesionesComponent,
    canActivate: [roleGuard], // Sólo una vez el canActivate con roleGuard
    data: { expectedRole: 'administrador' } // Se puede pasar un array de roles si es necesario
  },
  // { path: 'sesiones', component: SesionesComponent, canActivate: [usuariosGuard] },
  {
    path: 'usuarios',
    component: ListaUsuariosComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'administrador' }
  },
  { path: 'usuarios/editar/:id', component: EditarUsuariosComponent },
  { path: 'usuarios/agregar', component: EditarUsuariosComponent },
  { path: 'register', component: RegistrarComponent },
  { path: 'iniciarsesion', component: IniciarSesionComponent },
  { path: '**', redirectTo: '/inicio', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
