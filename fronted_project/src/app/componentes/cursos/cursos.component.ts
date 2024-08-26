import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { Curso } from '../../dataservice/cursos';
import { DataService } from '../../dataservice/data.service';
import { Usuario } from '../../dataservice/usuario';
import { TrainingSession } from '../../dataservice/sesiones'; // Asegúrate de importar el tipo de sesión

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  cursos: (Curso & { sessions: TrainingSession[] })[] = [];
  selectedIds: number[] = [];
  usuariosPorCurso: { [key: number]: Usuario[] } = {};

  // Variables para paginación y orden
  p: number = 1; // Paginación inicial (página 1)
  order: string = 'id'; // Orden inicial por el campo 'id'
  reverse: boolean = false; // Control para invertir el orden

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getCursos();
  }

  getCursos(): void {
    this.dataService.getCursos().subscribe(
      (cursos: Curso[]) => {
        if (cursos.length === 0) {
          console.warn('No hay cursos disponibles.');
        }
        
        // Obtener sesiones para cada curso
        const courseRequests = cursos.map(curso =>
          this.dataService.getTrainingSessionsPorCurso(curso.id).pipe(
            catchError(error => {
              console.error(`Error al obtener sesiones para el curso ${curso.id}:`, error);
              return of({ sessions: [] });
            })
          )
        );

        forkJoin(courseRequests).subscribe(results => {
          this.cursos = cursos.map((curso, index) => ({
            ...curso,
            sessions: results[index].sessions || []
          }));

          // Cargar usuarios por curso
          this.cursos.forEach(curso => this.loadUsuariosPorCurso(curso.id));
          console.log('Cursos obtenidos:', this.cursos);
        });
      },
      (error: any) => console.error('Error al obtener cursos', error)
    );
  }

  loadUsuariosPorCurso(courseId: number): void {
    this.dataService.getUsuariosPorCurso(courseId).subscribe(
      usuarios => {
        this.usuariosPorCurso[courseId] = usuarios;
      },
      error => {
        console.error('Error al cargar usuarios:', error);
      }
    );
  }

  onCheckboxChange(event: any, id: number): void {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
    }
  }

  borrarCurso(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      this.dataService.deleteCurso(id).subscribe(() => {
        this.cursos = this.cursos.filter(curso => curso.id !== id);
      });
    } else {
      alert('Eliminación cancelada');
    }
  }

  eliminarSeleccionados(): void {
    if (this.selectedIds.length === 0) {
      alert('No hay cursos seleccionados para eliminar.');
      return;
    }

    const cursosAEliminar = this.cursos.filter(curso => this.selectedIds.includes(curso.id));
    console.log('Cursos a eliminar:', cursosAEliminar);

    if (confirm('¿Estás seguro de que deseas eliminar los cursos seleccionados?')) {
      this.selectedIds.forEach(id => {
        this.dataService.deleteCurso(id).subscribe(() => {
          this.cursos = this.cursos.filter(curso => curso.id !== id);
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

  // Cambia el campo y el sentido del orden
  setOrder(field: string, ascending: boolean) {
    this.order = field;
    this.reverse = !ascending; // Si ascending es true, reverse será false (ascendente)
  }
}
