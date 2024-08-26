import { Component, inject, NgProbeToken, OnInit, runInInjectionContext } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../../servicios/auth/login.service';
import { LoginRequest } from '../../../servicios/auth/loginRequest';
import { DataService } from '../../../dataservice/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.css'
})
export class IniciarSesionComponent implements OnInit{

  formulario: FormGroup;
  loginError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private loginService: LoginService
  ) {
    this.formulario = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
 


ngOnInit(): void {}


onSubmit(): void {
  const csrfToken = this.getCookie('csrftoken'); // Obtén el token CSRF

  const headers = new HttpHeaders({
    'X-CSRFToken': csrfToken || '',  // Incluye el token CSRF en los encabezados
    'Content-Type': 'application/json'
  });

  this.http.post('http://localhost:8000/login', this.formulario.getRawValue(), { 
    headers: headers,
    withCredentials: true
  }).subscribe(() => this.router.navigate(['/']), error => console.error('Error:', error));
}


getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

get username() {
  return this.formulario.controls['username'];
}

get password() {
  return this.formulario.controls['password'];
}
}





  

  




