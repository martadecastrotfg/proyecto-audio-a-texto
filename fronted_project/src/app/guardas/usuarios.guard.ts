import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { UsuarioService } from '../servicios/usuario/usuario.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class usuariosGuard implements CanActivate {

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    return this.usuarioService.isAuthenticated().pipe(
      map(isAuth => {
        if (isAuth) {
          return true; // Usuario está autenticado
        } else {
          console.log('Token no es válido o ya expiró');
          this.router.navigate(['iniciarsesion']); // Redirige al login
          return false;
        }
      }),
      catchError(() => {
        console.log('Token no es válido o ya expiró');
        this.router.navigate(['iniciarsesion']); // Redirige al login en caso de error
        return [false]; // Retorna false en caso de error
      })
    );
  }
  

}