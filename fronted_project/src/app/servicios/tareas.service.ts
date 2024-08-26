import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = 'http://localhost:8000/';

  constructor(private http: HttpClient) { }

  subirTarea(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}subir-tarea/`, formData);
  }
  analizarWav(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}analizar-tarea/`, formData);
  }
}
