import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../auth/users';
import { catchError, Observable, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginService } from '../auth/login.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/user';

  constructor(private http: HttpClient) { }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.http.get(this.apiUrl, { withCredentials: true }).subscribe(
        () => {
          observer.next(true);
          observer.complete();
        },
        () => {
          observer.next(false);
          observer.complete();
        }
      );
    });
  }

  // Método para obtener los datos del usuario
  getUserData(): Observable<User> {
    return this.http.get<User>(this.apiUrl, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error obteniendo los datos del usuario', error);
        return throwError(error);
      })
    );
  }
  
}
