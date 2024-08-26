import { Component, OnInit } from '@angular/core';
import { DataService } from '../../dataservice/data.service';
import { TrainingSession } from '../../dataservice/sesiones';
import { Actividades } from '../../dataservice/actividad';
import { Router } from '@angular/router';
import { Curso } from '../../dataservice/cursos';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Usuario } from '../../dataservice/usuario';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../../emitters/emmiters';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-sesionesusuario',
  templateUrl: './sesionesusuario.component.html',
  styleUrls: ['./sesionesusuario.component.css']
})
export class SesionesusuarioComponent implements OnInit {
  sessions: TrainingSession[] = [];
  filterResults: boolean = false;
  selectedActivities: Actividades[] = [];
  userId: number =0;
  // cursos: Curso[] = [];
  userLoginOn: boolean = false;
  user?: Usuario;
  message: string = '';
  completedActivitiesCount: number = 0;
  completedSessions: TrainingSession[] = [];
  incompleteSessions: TrainingSession[] = [];

  cursos: (Curso & { sessions: TrainingSession[] })[] = [];



  constructor(
    private dataService: DataService, 
    private usuarioService: UsuarioService, 
    private router: Router,
    private http: HttpClient,
    private dataservice: DataService
  ) {}

  
  ngOnInit(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user && this.user.id !== undefined) {
          this.userId = this.user.id;
          this.loadCursosPorUsuario();
          this.userLoginOn = true;
          Emitters.authEmitter.emit(true);
        }
      },
      err => {
        this.userLoginOn = false;
        Emitters.authEmitter.emit(false);
      }
    );
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
            this.cursos = cursos.map((curso, index) => ({
              ...curso,
              sessions: results[index].sessions || []
            }));

            this.updateProgressForSessions();
          });
        },
        error => console.error('Error al cargar cursos:', error)
      );
    }
  }

  async updateProgressForSessions(): Promise<void> {
    const allSessions = this.cursos.flatMap(curso => curso.sessions);

    if (!allSessions || allSessions.length === 0) {
      console.warn('No se encontraron sesiones.');
      return;
    }

    const sessionActivityCounts: { [sessionId: number]: number } = {};
    const sessionTotalActivities: { [sessionId: number]: number } = {};

    const observables = allSessions.flatMap(session =>
      session.activities?.map(async activity => {
        const hasResults = await this.dataService.getResultadosPorIdPromise(this.userId, session.id, activity.id);
        if (hasResults) {
          sessionActivityCounts[session.id] = (sessionActivityCounts[session.id] || 0) + 1;
        }
      }) || []
    );

    await Promise.all(observables);

    this.completedSessions = [];
    this.incompleteSessions = [];
    this.cursos.forEach(curso => {
      curso.sessions.forEach(session => {
        const completedActivities = sessionActivityCounts[session.id] || 0;
        const totalActivities = session.activities?.length || 0;

        if (completedActivities === totalActivities) {
          this.completedSessions.push({
            ...session,
            completed_activities: completedActivities,
            total_activities: totalActivities
          });
        } else {
          this.incompleteSessions.push({
            ...session,
            completed_activities: completedActivities,
            total_activities: totalActivities
          });
        }
      });
    });

    console.info('Sesiones completadas:', this.completedSessions);
    console.info('Sesiones sin finalizar:', this.incompleteSessions);
  }
  

  // loadCursosPorUsuario(): void {
  //   if (this.userId) {
  //     this.dataService.getCursosPorUsuario(this.userId).subscribe(
  //       cursos => {
  //         if (cursos.length === 0) {
  //           console.warn('El usuario no está inscrito en ningún curso.');
  //         }
  //         this.cursos = cursos;
  //         this.loadTrainingSessionsPorCursos(this.userId);
  //         console.info('cursos');

  //       },
  //       error => console.error('Error al cargar cursos:', error)
  //     );
  //   }
  // }

  // loadCursosPorUsuario(): void {
  //   if (this.userId) {
  //     this.dataService.getCursosPorUsuario(this.userId).subscribe(
  //       cursos => {
  //         if (cursos.length === 0) {
  //           console.warn('El usuario no está inscrito en ningún curso.');
  //         }
  //         const courseRequests = cursos.map(curso =>
  //           this.dataService.getTrainingSessionsPorCurso(curso.id).pipe(
  //             catchError(error => {
  //               console.error(`Error al obtener sesiones para el curso ${curso.id}:`, error);
  //               return of({ sessions: [] }); // Maneja el error devolviendo un objeto vacío
  //             })
  //           )
  //         );

  //         forkJoin(courseRequests).subscribe(results => {
  //           this.cursos = cursos.map((curso, index) => ({
  //             ...curso,
  //             sessions: results[index].sessions || [] // Asocia las sesiones cargadas a cada curso
  //           }));

  //           console.log('Cursos con sesiones:', this.cursos); // Verifica la estructura de los cursos
  //         });
  //       },
  //       error => console.error('Error al cargar cursos:', error)
  //     );
  //   }
  // }


  loadTrainingSessionsPorCursos(userId: number): void {
  //   if (this.cursos.length === 0) {
  //     console.warn('No se encontraron cursos para cargar sesiones.');
  //     return;
  //   }
  
  //   const courseRequests = this.cursos.map(curso =>
  //     this.dataService.getTrainingSessionsPorCurso(curso.id, this.filterResults).toPromise()
  //   );
  
  //   Promise.all(courseRequests).then(results => {
  //     const allSessions = results.flat().filter((session): session is TrainingSession => session !== undefined);

  //     this.updateProgressForSessions(userId,allSessions);
      
  //     // Asegúrate de que cada sesión tenga las propiedades `completed_activities` y `total_activities`
  //     this.sessions = allSessions.map(session => ({
  //       ...session,
  //       completed_activities: session.completed_activities || 0,
  //       total_activities: session.total_activities || 0
  //     }));
  //   }).catch(error => {
  //     console.error('Error al cargar sesiones por curso:', error);
  //   });
  }
  

  // async updateProgressForSessions(userId: number, allSessions: TrainingSession[]): Promise<void> {
  //   if (!allSessions || allSessions.length === 0) {
  //     console.warn('No se encontraron sesiones.');
  //     return;
  //   }
  
  //   // Crea un mapa para contar las actividades completadas por sesión
  //   const sessionActivityCounts: { [sessionId: number]: number } = {};
  
  //   const observables = allSessions.flatMap(session =>
  //     session.activities?.map(async activity => {
  //       const hasResults = await this.dataService.getResultadosPorIdPromise(userId, session.id, activity.id);
  //       if (hasResults) {
  //         // Aumenta el contador de actividades completadas para la sesión correspondiente
  //         sessionActivityCounts[session.id] = (sessionActivityCounts[session.id] || 0) + 1;
  //       }
  //     }) || []
  //   );
  
  //   // Espera que todos los observables terminen
  //   await Promise.all(observables);
  
  //   // Actualiza la propiedad completed_activities de cada sesión
  //   this.sessions = this.sessions.map(session => ({
  //     ...session,
  //     completed_activities: sessionActivityCounts[session.id] || 0
  //   }));
  
  //   console.info('Sesiones actualizadas:', this.sessions);
  // }
  




  openActivitiesModal(activities: Actividades[]): void {
    this.selectedActivities = activities;
    const modalElement = document.getElementById('activitiesModal')!;
    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.style.display = 'flex';
    modalElement.style.alignItems = 'center';
    modalElement.style.justifyContent = 'center';
  
    modal.show();
  }

  startSession(sessionId: number): void {
    this.router.navigate(['/player', sessionId]);
  }
}
