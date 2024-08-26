import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../../dataservice/usuario';
import { DataService } from '../../dataservice/data.service';

@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.component.html',
  styleUrls: ['./editar-usuarios.component.css']
})
export class EditarUsuariosComponent implements OnInit {

  selectedRole: string | null = null;
  usuario: Usuario = new Usuario(0, '', '', '', '', '', '', false, true, false);
  id: number | null = null;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      console.log("EDITAR");
      this.dataService.getUsuario(this.id).subscribe(
        data => {
          this.usuario = data;
          this.selectedRole = this.mapRoleToSelectedRole(this.usuario.rol);
        },
        error => {
          console.log(error);
        }
      );
    } else {
      console.log("CREAR");
    }
  }

  mapRoleToSelectedRole(role: string): string {
    switch(role) {
      case 'administrador': return '0';
      case 'entrenador': return '1';
      case 'entrenado': return '2';
      default: return '';
    }
  }

  mapSelectedRoleToRole(selectedRole: string): string {
    switch(selectedRole) {
      case '0': return 'administrador';
      case '1': return 'entrenador';
      case '2': return 'entrenado';
      default: return '';
    }
  }

  onSubmit(): void {
    this.usuario.rol = this.mapSelectedRoleToRole(this.selectedRole || '');

    if (this.id) {
      // Actualizar usuario existente
      this.dataService.updateUsuario(this.usuario).subscribe(
        data => {
          console.log('Usuario actualizado:', data);
          alert('Usuario actualizado exitosamente');
          this.router.navigate(['/usuarios']);
        },
        error => {
          console.error('Error al actualizar el usuario:', error);
        }
      );
    } else {
      // Crear un nuevo usuario
      this.dataService.createUsuario(this.usuario).subscribe(
        data => {
          console.log('Usuario creado:', data);
          alert('Usuario creado exitosamente');
          this.router.navigate(['/usuarios']);
        },
        error => {
          console.error('Error al crear el usuario:', error);
        }
      );
    }
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }
}
