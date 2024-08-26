import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../../emitters/emmiters';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'] // Corregido el nombre a 'styleUrls'
})
export class NavComponent implements OnInit {
  authenticated = false;
  user: any;
  userrol: string = '';
  userLoginOn = false;
  username: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
        if (this.authenticated) {
          this.getUserRole();
        }
      }
    );
  }

  getUserRole(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.username = this.user.username;
          this.userrol = this.user.rol;
          this.userLoginOn = true;
        }
      },
      err => {
        this.userLoginOn = false;
        Emitters.authEmitter.emit(false);
      }
    );
  }
}
