import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Actividades } from '../../dataservice/actividad';
import { DataService } from '../../dataservice/data.service';
import { Emitters } from '../../emitters/emmiters';
import { Usuario } from '../../dataservice/usuario';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  currentActivity: Actividades | null = null;
  isRecording = false;
  activityIndex: number = 0;  // Índice de la actividad actual
  totalActivities: number = 0;  // Total de actividades en la sesión
  recordingStarted: boolean = false;  // Indica si se ha iniciado la grabación
  recordingBlob: Blob | null = null;  // Blob del audio grabado

  @ViewChild('audio', { static: false }) audio!: ElementRef<HTMLAudioElement>;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  sessionId: number | undefined;
  session: any;
  userLoginOn: boolean = false;
  user?: Usuario;
  userId: number | null = null;
  currentItemIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
              this.sessionId = +id;
              this.loadSession();
            }
          });
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

  ngAfterViewInit(): void {}

  loadSession(): void {
    if (this.sessionId !== undefined) {
        this.dataService.getTrainingSessionsId(this.sessionId).subscribe(
            (session: any) => {
                this.session = session;
                if (session.activities && session.activities.length > 0) {
                    this.totalActivities = session.activities.length;
                    this.activityIndex = 0; // Inicia en la primera actividad
                    this.currentActivity = session.activities[this.activityIndex];
                } else {
                    this.currentActivity = null;
                }
            },
            (error: any) => {
                console.error('Error loading session:', error);
            }
        );
    } else {
        console.error('Session ID is undefined');
    }
}


  toggleRecording(): void {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        if (this.audio) {
          this.recordingBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(this.recordingBlob);
          this.audio.nativeElement.src = audioUrl;
          this.audioChunks = [];
          this.recordingStarted = true;
        }
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    });
  }

  stopRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  uploadAudio(): void {
    if (!this.recordingBlob || !this.currentActivity?.id || this.recordingStarted === false) {
      console.error('No audio to upload or no activity selected');
      return;
    }

    if (!this.sessionId) {
      console.error('Session ID is not available');
      return;
    }

    // Confirmación antes de subir
    if (confirm('¿Estás seguro de que esta es la grabación final?')) {
      const formData = new FormData();
      formData.append('activity_id', this.currentActivity.id.toString() );
      formData.append('datetime', new Date().toISOString());
      formData.append('task', JSON.stringify({ key: 'value' }));
      formData.append('session_id', this.sessionId.toString());
      console.info(this.sessionId, this.sessionId.toString() );
      if (this.userId !== null) {
        formData.append('user_id', this.userId.toString());
      } else {
        console.error('User ID is not available');
        return;
      }

      
      formData.append('audio_file', this.recordingBlob, 'audio.wav');

      this.http.post('http://localhost:8000/upload-result/', formData).subscribe(
        response => {
          console.log('Archivo de audio subido exitosamente', response);
          this.currentActivity!.completed = true;
          this.recordingStarted = false;
          this.recordingBlob = null;
          this.checkAndMoveToNextActivity();
        },
        error => {
          console.error('Error al subir el archivo de audio', error);
        }
      );
    }
}

  // Navegar entre items
  goToPreviousItem() {
    if (this.currentItemIndex > 0) {
      this.currentItemIndex--;
    }
  }

  goToNextItem() {
    if (this.currentActivity && this.currentItemIndex < this.currentActivity.items.length - 1) {
      this.currentItemIndex++;
    }
  }
  

  discardRecording(): void {
    this.recordingStarted = false;
    this.recordingBlob = null;
    if (this.audio) {
      this.audio.nativeElement.src = ''; // Limpiar el reproductor de audio
    }
  }

  checkAndMoveToNextActivity(): void {
    if (this.session && this.activityIndex < this.session.activities.length - 1) {
      this.activityIndex++;
      this.currentActivity = this.session.activities[this.activityIndex];
    } else {
      alert('Has completado todas las actividades.');
    }
  }

  goToPreviousActivity(): void {
    if (this.activityIndex > 0) {
      this.activityIndex--;
      this.currentActivity = this.session.activities[this.activityIndex];
    }
  }

  goToNextActivity(): void {
    if (this.session && this.activityIndex < this.session.activities.length - 1) {
      this.activityIndex++;
      this.currentActivity = this.session.activities[this.activityIndex];
    }
  }

  goBack(): void {
    const pendingActivities = this.session.activities.filter((activity: Actividades) => !activity.completed).length;
    if (pendingActivities > 0) {
      if (confirm(`Recuerda que te quedan ${pendingActivities} actividades por completar. ¿Estás seguro de que quieres volver?`)) {
        this.router.navigate(['/sesionesusuario']);
      }
    } else {
      this.router.navigate(['/sesionesusuario']);
    }
  }
}
