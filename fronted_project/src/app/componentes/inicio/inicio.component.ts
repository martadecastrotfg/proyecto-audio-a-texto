import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Emitters } from '../../emitters/emmiters';
import { DataService } from '../../dataservice/data.service';
import { Usuario } from '../../dataservice/usuario';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  authenticated = false;
  user: any;
  editMode = false;  // Indica si está en modo edición

  constructor(
    private http: HttpClient,
    private router: Router,
    private dataService: DataService  // Inyectar el servicio
  ) { }

  userLoginOn: boolean = false;
  userData: Usuario | null = null;
  editUserData: Usuario = new Usuario(0, '', '', '', '', '', '', false, true, false);

  message: string = '';
  newPassword: string = '';
  selectedFile: File | null = null;
  avatarFile: File | null = null;

  ngOnInit(): void {
    this.http.get<Usuario>('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: Usuario) => {
        this.userData = res;
        this.message = `Hi ${this.userData.first_name} ${this.userData.last_name}`;
        this.userLoginOn = true;
        this.editUserData = { ...this.userData };
        Emitters.authEmitter.emit(true);
      },
      err => {
        this.message = 'You are not logged in';
        this.userLoginOn = false;
        Emitters.authEmitter.emit(false);
      }
    );
  }
  
  

  // Manejar el archivo seleccionado
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.avatarFile = file;
    }
  }

  // Actualizar los datos del usuario
  updateUserData() {
    if (!this.editUserData?.id) {
      console.error('ID del usuario no proporcionado');
      return;
    }

  
    // Opcional: Actualiza el campo de la contraseña solo si se ha cambiado
    // if (!this.newPassword) {
    //   delete this.userData.password;
    // } else {
    //   this.userData.password = this.newPassword;
    // }

    this.dataService.updateUsuario(this.editUserData)
      .subscribe(
        (data) => {
          console.log('Usuario actualizado:', data);
          alert('Usuario actualizado exitosamente');
          this.editMode = false; // Desactivar modo edición después de guardar cambios
        },
        error => {
          console.error('Error al actualizar el usuario:', error);
          alert('Error al actualizar el usuario');
        }
      );
  }

  // Cerrar sesión
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
