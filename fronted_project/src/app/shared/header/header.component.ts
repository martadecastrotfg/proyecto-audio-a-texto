import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../../emitters/emmiters';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  authenticated = false;
  user: any;
  userrol: string = '';
  userLoginOn = false;
  nombre: string = '';
  apellido: string = '';


   constructor(
    private http: HttpClient,
    private router: Router
  ) { }
  

  ngOnInit(): void {
    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
        if (this.authenticated) {
          this.getUserInfo();
        }
      }
    );
  }

  getUserInfo(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.nombre = this.user.first_name;
          this.apellido = this.user.last_name;
          this.userLoginOn = true;
        }
      },
      err => {
        this.userLoginOn = false;
        Emitters.authEmitter.emit(false);
      }
    );
  }

  onLogout(): void {
    this.http.post('http://localhost:8000/logout', {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.authenticated = false;
          this.router.navigate(['/iniciarsesion']);
        },
        error: (err) => {
          console.error('Error durante logout', err);
        }
      });
  }
  


}



