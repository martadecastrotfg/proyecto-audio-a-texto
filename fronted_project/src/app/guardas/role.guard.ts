import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UsuarioService } from '../servicios/usuario/usuario.service';
import { DataService } from '../dataservice/data.service';

@Injectable({
  providedIn: 'root'
})
export class roleGuard implements CanActivate {

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private dataService: DataService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Verificar la autenticación
    return this.usuarioService.isAuthenticated().pipe(
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          // Si el usuario está autenticado, obtener los datos del usuario
          return this.usuarioService.getUserData().pipe(
            switchMap(user => {
              if (user) {
                console.log('User ID:', user.id); // Obtener el ID del usuario

                // Llamar al método getUsuario para obtener el rol del usuario
                return this.dataService.getUsuario(user.id).pipe(
                  map(usuarioDetails => {
                    console.info('User Role:', usuarioDetails.rol); // Obtener el rol del usuario

                    // Verifica el rol del usuario para determinar si puede acceder
                    if (usuarioDetails.rol === route.data['expectedRole']) {
                      console.info('Es admin, puede entrar');
                      return true;
                    }
                    console.info('Está bien, pero no es admin, USUARIO');
                    this.router.navigate(['/sesionesusuario']); // Redirige en caso de error
                    return false;
                  }),
                  catchError(error => {
                    console.error('Error obteniendo detalles del usuario', error);
                    this.router.navigate(['/iniciarsesion']); // Redirige en caso de error
                    return of(false);
                  })
                );
              } else {
                console.log('No se encontraron datos del usuario');
                this.router.navigate(['/iniciarsesion']); // Redirige si los datos del usuario no se encuentran
                return of(false);
              }
            }),
            catchError(error => {
              console.error('Error obteniendo datos del usuario', error);
              this.router.navigate(['/iniciarsesion']); // Redirige en caso de error
              return of(false);
            })
          );
        } else {
          console.log('Token no es válido o ya expiró');
          this.router.navigate(['/iniciarsesion']); // Redirige si el usuario no está autenticado
          return of(false);
        }
      }),
      catchError(() => {
        console.log('Token no es válido o ya expiró');
        this.router.navigate(['/iniciarsesion']); // Redirige en caso de error
        return of(false);
      })
    );
  }

  // Implementación del método hasAccess
  private hasAccess(role: string): boolean {
    // Implementa la lógica para verificar los roles
    const allowedRoles = ['admin', 'manager']; // Roles permitidos
    return allowedRoles.includes(role);
  }
}
