import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../dataservice/data.service';
import { TrainingSession } from '../../dataservice/sesiones';
import { Usuario } from '../../dataservice/usuario';
import { Emitters } from '../../emitters/emmiters';

declare var bootstrap: any; // Importa la instancia de Bootstrap


@Component({
  selector: 'app-sesiones',
  templateUrl: './sesiones.component.html',
  styleUrls: ['./sesiones.component.css']
})
export class SesionesComponent implements OnInit {
  sessionName: string = '';
  // sessionId: string = '';
  sessionDescription: string = '';
  sessionStatus: string = 'activo';
  sessions: TrainingSession[] = [];
  selectedIds: number[] = [];
  user?: Usuario;
  sessionId: number | undefined;
  session: any;
  userLoginOn: boolean = false;
  userId: number | null = null;
  
  editSession: any = {}; 
  activities: any[] = []; // Para almacenar la lista de actividades
  selectedActivities: number[] = []; // Para almacenar las actividades seleccionadas

  activeSessions: any[] = [];   // Para sesiones activas
  testingSessions: any[] = [];  // Para sesiones en prueba

  private apiUrl = 'http://localhost:8000/sesiones/'; // Ajusta la URL según tu configuración

  constructor(private http: HttpClient, private router: Router, private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.loadSessions();
          this.loadActivities(); // Cargar actividades aquí
          this.userId = this.user.id;
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
  loadActivities(): void {
    this.http.get('http://localhost:8000/actividad').subscribe({
      next: (data: any) => {
        this.activities = data;
        console.log('Actividades obtenidas:', data);
      },
      error: (error) => {
        console.error('Error al cargar actividades', error);
      }
    });
  }

  loadSessions(): void {
    this.dataService.getTrainingSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        console.log('Sesiones obtenidas:', data);
      },
      error: (error) => {
        console.error('Error al cargar sesiones', error);
      }
    });
  }

  // Método para abrir el modal y cargar la sesión seleccionada
  openEditModal(session: TrainingSession): void {
    this.editSession = { ...session }; // Copia los datos de la sesión seleccionada
    const modalElement = document.getElementById('editSessionModal')!;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onEditSubmit(): void {
    // Envía los cambios realizados en la sesión editada
    this.editSession.modified_user=this.userId;
    console.info(this.editSession);
    this.dataService.updateTrainingSession(this.editSession.id, this.editSession).subscribe({
      next: (response) => {
        console.log('Sesión actualizada con éxito', response);
        this.loadSessions();
        // Cierra el modal
        const modalElement = document.getElementById('editSessionModal')!;
        const modal = bootstrap.Modal.getInstance(modalElement); // Obtiene la instancia del modal
        modal.hide();
      },
      error: (error) => {
        console.error('Error al actualizar sesión', error);
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

  deleteSession(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      this.dataService.deleteTrainingSession(id).subscribe(() => {
        this.sessions = this.sessions.filter(session => session.id !== id);
      });
    } else {
      alert('Eliminación cancelada');
    }
  }

  deleteSelectedSessions(): void {
    if (this.selectedIds.length === 0) {
      alert('No hay sesiones seleccionadas para eliminar.');
      return;
    }

    const sessionsToDelete = this.sessions.filter(session => this.selectedIds.includes(session.id));
    console.log('Sesiones a eliminar:', sessionsToDelete);

    if (confirm('¿Estás seguro de que deseas eliminar las sesiones seleccionadas?')) {
      this.selectedIds.forEach(id => {
        this.dataService.deleteTrainingSession(id).subscribe(() => {
          this.sessions = this.sessions.filter(session => session.id !== id);
        });
      });
      this.selectedIds = []; // Limpiar selección
    } else {
      alert('Eliminación cancelada');
    }
  }

  onSubmit(): void {
    if (!this.userId) {
      console.error('ID del usuario no disponible');
      return;
    }
  
    const newSession = {
      name: this.sessionName,
      session_id: this.sessionId,  
      description: this.sessionDescription,
      status: this.sessionStatus,
      created_user: this.userId, 
      activities: this.selectedActivities 
    };
    console.info(newSession);
  
    this.http.post(this.apiUrl, newSession, { observe: 'response' }).subscribe({
      next: (response) => {
        console.log('Sesión creada con éxito', response.body);
        this.router.navigate(['/sesiones']); // Redirige a la página de sesiones, si es necesario
      },
      error: (error) => {
        console.error('Error al crear sesión', error);
      }
    });
  }

  
}
