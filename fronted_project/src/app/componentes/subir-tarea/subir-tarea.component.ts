import { Component } from '@angular/core';
import { TareaService } from '../../servicios/tareas.service';

@Component({
  selector: 'app-subir-tarea',
  templateUrl: './subir-tarea.component.html',
  styleUrls: ['./subir-tarea.component.css']
})
export class SubirTareaComponent {
  archivo: File | null = null;
  nombre: string = '';
  descripcion: string = '';
  resultado: any = null;
  error: string = '';
  archivos: string[] = [];
  selectedWavFile: File | null = null;
  taskId: number | null = null; // Asegúrate de que esta propiedad esté disponible

  constructor(private tareaService: TareaService) {}

  // Maneja el cambio de archivo ZIP
  onZipFileChange(event: any) {
    this.archivo = event.target.files[0];
  }

  // Envía el archivo ZIP al backend
  onSubmitZip() {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('file', this.archivo);
      formData.append('nombre', this.nombre);
      formData.append('descripcion', this.descripcion);

      this.tareaService.subirTarea(formData).subscribe(response => {
        this.resultado = response;
        this.error = '';
        if (response.task_id) {
          this.taskId = response.task_id; // Almacena el ID de la tarea
        }
        this.archivos = response.archivos || []; // Suponiendo que la respuesta incluye una lista de archivos
      }, error => {
        this.error = 'Error al subir la tarea: ' + error.message;
        this.resultado = null;
      });
    }
  }

  // Maneja el cambio de archivo WAV
  onWavFileChange(event: any) {
    this.selectedWavFile = event.target.files[0];
  }

  // Envía el archivo WAV para análisis
  onAnalizar() {
    if (this.selectedWavFile && this.taskId) {
      const formData = new FormData();
      formData.append('wavFile', this.selectedWavFile);
      formData.append('task_id', this.taskId.toString()); // Asegúrate de que `task_id` sea una cadena

      this.tareaService.analizarWav(formData).subscribe(response => {
        this.resultado = response;
        this.error = '';
      }, error => {
        this.error = 'Error al analizar el archivo WAV: ' + error.message;
        this.resultado = null;
      });
    } else {
      this.error = 'Por favor, selecciona un archivo WAV y asegúrate de que una tarea esté subida.';
    }
  }
}
