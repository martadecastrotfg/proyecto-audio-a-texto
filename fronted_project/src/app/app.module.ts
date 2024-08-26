import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaUsuariosComponent } from './componentes/lista-usuarios/lista-usuarios.component';
import { EditarUsuariosComponent } from './componentes/editar-usuarios/editar-usuarios.component';

import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavComponent } from './shared/nav/nav.component';
import { RegistrarComponent } from './componentes/usuarios/registrar/registrar.component';
import { IniciarSesionComponent } from './componentes/usuarios/iniciar-sesion/iniciar-sesion.component';
import { SesionesComponent } from './componentes/sesiones/sesiones.component';
import { DataService } from './dataservice/data.service';


import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import { CursosComponent } from './componentes/cursos/cursos.component';
import { SesionesusuarioComponent } from './componentes/sesionesusuario/sesionesusuario.component';
import { PlayerComponent } from './componentes/player/player.component';
import { ActividadesComponent } from './componentes/actividades/actividades.component';
import { ItemsComponent } from './componentes/items/items.component';
import { SubirTareaComponent } from './componentes/subir-tarea/subir-tarea.component'
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { InicioComponent } from './componentes/inicio/inicio.component';


@NgModule({
  declarations: [
    AppComponent,
    ListaUsuariosComponent,
    EditarUsuariosComponent,
    HeaderComponent,
    FooterComponent,
    NavComponent,
    RegistrarComponent,
    IniciarSesionComponent,
    SesionesComponent,
    CursosComponent,
    SesionesusuarioComponent,
    PlayerComponent,
    ActividadesComponent,
    ItemsComponent,
    SubirTareaComponent,
    InicioComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OrderModule
  ],
  providers: [ 
    {provide: JWT_OPTIONS, useValue: JWT_OPTIONS},
    JwtHelperService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
