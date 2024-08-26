import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../dataservice/usuario';
import { DataService } from '../../dataservice/data.service';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  selectedIds: number[] = []; // Para manejar los usuarios seleccionados

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    this.dataService.getUsuarios()
      .subscribe(
        (usuarios: Usuario[]) => {
          this.usuarios = usuarios;
          console.log('Usuarios obtenidos:', usuarios); // Mostrar usuarios en consola
        },
        (error: any) => console.error('Error al obtener usuarios', error)
      );
  }

  onCheckboxChange(event: any, id: number): void {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
    }
  }

  borrarUsuario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.dataService.deleteUsuario(id)
      .subscribe(() => {
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
      });
    } else {
      alert('Eliminación cancelada');
    }
    
  }

  eliminarSeleccionados(): void {
    if (this.selectedIds.length === 0) {
        alert('No hay usuarios seleccionados para eliminar.');
        return;
    }

    // Obtener los datos de los usuarios seleccionados para eliminar
    const usuariosAEliminar = this.usuarios.filter(usuario => this.selectedIds.includes(usuario.id));
    console.log('Usuarios a eliminar:', usuariosAEliminar);

    if (confirm('¿Estás seguro de que deseas eliminar los usuarios seleccionados?')) {
        this.selectedIds.forEach(id => {
            this.dataService.deleteUsuario(id).subscribe(() => {
                this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
            });
        });
        this.selectedIds = []; // Limpiar selección
    } else {
        alert('Eliminación cancelada');
    }
}


  getRol(isStaff: boolean): string {
    return isStaff ? 'Admin' : 'Usuario';
  }
}



  