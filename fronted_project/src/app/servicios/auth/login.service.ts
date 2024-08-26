import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest } from './loginRequest';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8000/login';
  private currentUserLoginOn = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(this.apiUrl, credentials, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.storeToken(response.token);
          this.currentUserLoginOn.next(true);
        }
      })
    );
  }

  private storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  

  

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Elimina el token y el userId del localStorage
      localStorage.removeItem('token');

      // Notificar a otros componentes que el usuario ha cerrado sesión
      this.currentUserLoginOn.next(false);
    }
  }

  private handleError(error: any): Observable<never> {
    // Manejo de errores
    console.error('Ocurrió un error', error);
    throw error;
  }

  get currentUserStatus(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  get userLoginOn(): Observable<boolean>{
    return this.currentUserLoginOn.asObservable();
  }
}
