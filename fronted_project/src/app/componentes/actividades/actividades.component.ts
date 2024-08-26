import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../dataservice/data.service';
import { Usuario } from '../../dataservice/usuario';
import { Emitters } from '../../emitters/emmiters';
import { Actividades } from '../../dataservice/actividad';
import { catchError, of, forkJoin } from 'rxjs';
import { Curso } from '../../dataservice/cursos';
import { TrainingSession } from '../../dataservice/sesiones';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent implements OnInit {
  // Propiedades relacionadas con la creación de actividades
  activityName: string = '';
  activityDescription: string = '';
  activityInstruction: string = '';
  activityOrder: number | undefined;
  taskId: string = '';
  activityType: string = ''; // Nueva propiedad para el tipo de actividad

  // Propiedades relacionadas con la sesión de usuario
  sessionId: number | undefined;
  user?: Usuario;
  userLoginOn: boolean = false;
  activities: Actividades[] = [];
  selectedIds: number[] = [];
  userSessions: TrainingSession[] = [];
  userId: number = 0;

  TEXT_COMPLETE = 'texto_completo';
  WORDS = 'palabras_sueltas';

  private apiUrl = 'http://localhost:8000/actividades/'; // Ajusta la URL según tu configuración

  constructor(private http: HttpClient, private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.userId = this.user.id;
          this.userLoginOn = true;
          this.loadActivities();
          this.loadCursosPorUsuario();
          Emitters.authEmitter.emit(true);
        }
      },
      err => {
        this.userLoginOn = false;
        Emitters.authEmitter.emit(false);
      }
    );
  }

  loadActivities(): void {
    this.http.get<Actividades[]>('http://localhost:8000/actividad/')
      .subscribe(data => {
        this.activities = data;
      }, error => {
        console.error('Error al cargar actividades', error);
      });
  }

  loadCursosPorUsuario(): void {
    if (this.userId) {
      this.dataService.getCursosPorUsuario(this.userId).subscribe(
        cursos => {
          if (cursos.length === 0) {
            console.warn('El usuario no está inscrito en ningún curso.');
          }
          const courseRequests = cursos.map(curso =>
            this.dataService.getTrainingSessionsPorCurso(curso.id).pipe(
              catchError(error => {
                console.error(`Error al obtener sesiones para el curso ${curso.id}:`, error);
                return of({ sessions: [] });
              })
            )
          );

          forkJoin(courseRequests).subscribe(results => {
            this.userSessions = results.flatMap(result => result.sessions || []);
          });
        },
        error => console.error('Error al cargar cursos:', error)
      );
    }
  }

  onSubmit(): void {
    if (!this.userId) {
      console.error('ID del usuario no disponible');
      return;
    }

    const newActivity = {
      name: this.activityName,
      description: this.activityDescription,
      instruction: this.activityInstruction,
      order_in_session: this.activityOrder,
      task_id: this.taskId,
      type: this.activityType,
    };

    console.info(newActivity);

    this.http.post(this.apiUrl, newActivity, { observe: 'response' }).subscribe({
      next: (response) => {
        console.log('Actividad creada con éxito', response.body);
        this.router.navigate(['/actividades']); // Redirige a la página de actividades, si es necesario
      },
      error: (error) => {
        console.error('Error al crear actividad', error);
      }
    });
  }

  onCheckboxChange(event: any, id: number): void {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
    }
  }
}
