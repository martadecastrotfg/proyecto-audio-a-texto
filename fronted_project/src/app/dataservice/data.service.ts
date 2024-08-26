import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Usuario } from './usuario'; // Asegúrate de que esta ruta sea correcta
import { LoginRequest } from '../servicios/auth/loginRequest';
import { Curso } from './cursos';
import { TrainingSession } from './sesiones';
import { Resultados } from './resultados';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:8000'; // Base URL de tu API
  private headers = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
	const url = `${this.apiUrl}/usuarios/?format=json`;
    // const url = `${this.apiUrl}/usuarios?format=json`;
    return this.http.get<Usuario[]>(url, { headers: this.headers })
      .pipe(
        catchError(this.handleError<Usuario[]>('getUsuarios', []))
      );
  }

  getUsuario(id: number): Observable<Usuario> {
	const url = `${this.apiUrl}/usuarios/${id}?format=json`;
	return this.http.get<Usuario>(url, { headers: this.headers })
	  .pipe(
		catchError(this.handleError<Usuario>(`getUsuario id=${id}`))
	  );
  }
  

  deleteUsuario(id: number): Observable<void> {
	const url = `${this.apiUrl}/usuarios/${id}`;
	return this.http.delete<void>(url, { headers: this.headers })
	  .pipe(
		catchError(this.handleError<void>('deleteUsuario'))
	  );
  }
  

  createUsuario(usuario: Usuario): Observable<Usuario> {
	const url = `${this.apiUrl}/usuarios/`;
	console.log('Datos enviados para crear el usuario:', usuario);
	return this.http.post<Usuario>(url, usuario, { headers: this.headers })
	  .pipe(
		catchError((error: any): Observable<Usuario> => {
		  console.error('createUsuario failed:', error);
		  console.error('Response body:', error.error);
		  return this.handleError<Usuario>('createUsuario')(error);
		})
	  );
  }
  
  updateUsuario(usuario: Usuario): Observable<Usuario> {
	const url = `${this.apiUrl}/usuarios/${usuario.id}/?format=json`;
	return this.http.put<Usuario>(url, usuario, { headers: this.headers })
	.pipe(
		catchError((error: any): Observable<Usuario> => {
		  console.error('updateUsuario failed:', error);
		  console.error('Response body:', error.error);
		  return this.handleError<Usuario>('updateUsuario')(error);
		})
	  );
  }

  //CURSOS
	getCursos(): Observable<Curso[]> {
		const url = `${this.apiUrl}/cursos/?format=json`;
		return this.http.get<Curso[]>(url, { headers: this.headers })
		.pipe(
			catchError(this.handleError<Curso[]>('getCursos', []))
		);
	}

	getUsuariosPorCurso(course_id?: number): Observable<Usuario[]> {
		let url = `${this.apiUrl}/usuarios/?format=json`;
		if (course_id) {
			url += `&course_id=${course_id}`;
		}
		return this.http.get<Usuario[]>(url, { headers: this.headers })
		  .pipe(
			catchError(this.handleError<Usuario[]>('getUsuarios', []))
		  );
	}

	getCursosPorUsuario(userId: number): Observable<Curso[]> {
		const url = `${this.apiUrl}/cursos/?user_id=${userId}&format=json`;
		return this.http.get<Curso[]>(url, { headers: this.headers })
		  .pipe(
			catchError(this.handleError<Curso[]>('getCursosPorUsuario', []))
		  );
	}
	  
	
	

	deleteCurso(id: number): Observable<void> {
		const url = `${this.apiUrl}/cursos/${id}`;
		return this.http.delete<void>(url, { headers: this.headers })
		  .pipe(
			catchError(this.handleError<void>('deleteCurso'))
		  );
	  }


//Sesiones de entrenamiento

	getTrainingSessions(filterResults?: boolean): Observable<TrainingSession[]> {
		let url = `${this.apiUrl}/entrenamientos/?format=json`;
		if (filterResults !== undefined) {
		url += `&results=${filterResults ? 'yes' : 'no'}`;
		}
		return this.http.get<TrainingSession[]>(url, { headers: this.headers })
		.pipe(
			catchError(this.handleError<TrainingSession[]>('getTrainingSessions', []))
		);
	}

	getTrainingSessionsId(id: number): Observable<TrainingSession> {
		const url = `${this.apiUrl}/entrenamientos/${id}?format=json`;
		return this.http.get<TrainingSession>(url, { headers: this.headers })
		.pipe(
			catchError(this.handleError<TrainingSession>(`getTrainingSession id=${id}`))
		);
	}

	// getTrainingSessionsPorCurso(courseId: number, filterResults?: boolean): Observable<TrainingSession[]> {
	// 	let url = `${this.apiUrl}/entrenamientos/?course_id=${courseId}&format=json`;
	// 	if (filterResults !== undefined) {
	// 	  url += `&results=${filterResults ? 'yes' : 'no'}`;
	// 	}
	// 	return this.http.get<TrainingSession[]>(url, { headers: this.headers })
	// 	  .pipe(
	// 		catchError(this.handleError<TrainingSession[]>('getTrainingSessionsPorCurso', []))
	// 	  );
	// }

	// Método para obtener sesiones por curso
	getTrainingSessionsPorCurso(courseId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/courses/${courseId}/sessions/`);
	}
	
	deleteTrainingSession(id: number): Observable<void> {
		const url = `${this.apiUrl}/entrenamientos/${id}/`;
		return this.http.delete<void>(url)
		  .pipe(catchError(this.handleError<void>('deleteTrainingSession')));
	}

	// updateTrainingSession(session: TrainingSession): Observable<TrainingSession> {
	// 	const url = `${this.apiUrl}/entrenamientos/${session.id}/`;
	// 	return this.http.put<TrainingSession>(url, session, { headers: this.headers })
	// 	  .pipe(catchError(this.handleError<TrainingSession>('updateTrainingSession')));
	// }

	updateTrainingSession(id: number, sessionData: any): Observable<any> {
		return this.http.put(`${this.apiUrl}/entrenamientos/${id}/`, sessionData);
	}
	  
	  
	  
	  


//RESULTADOS	  

getResultadosPorId(id: number, sesionid: number, activityid: number): Observable<Resultados[]> {
    const url = `${this.apiUrl}/results/?user_id=${id}&session_id=${sesionid}&activity_id=${activityid}&format=json`;
    
    return this.http.get<Resultados[]>(url, { headers: this.headers })
        .pipe(
            catchError(this.handleError<Resultados[]>(`getResultados id=${id}`))
        );
}



// Función que devuelve un Observable<boolean>
getResultadosPorId2(userId: number, sessionId: number, activityId: number): Observable<boolean> {
    const url = `${this.apiUrl}/results/?user_id=${userId}&session_id=${sessionId}&activity_id=${activityId}&format=json`;

    return this.http.get<any[]>(url).pipe(
      map(results => results.length > 0), // Retorna true si hay resultados, false si no los hay
      catchError(error => {
        if (error.status === 404) {
          console.warn(`No se encontraron resultados para usuario ${userId}, sesión ${sessionId}, actividad ${activityId}.`);
        } else {
          console.error(`Error al obtener resultados para usuario ${userId}, sesión ${sessionId}, actividad ${activityId}:`, error);
        }
        return of(false); // Retorna false en caso de error
      })
    );
  }

  // Función que devuelve una Promise<boolean>
  async getResultadosPorIdPromise(userId: number, sessionId: number, activityId: number): Promise<boolean> {
    try {
      // Aquí utilizamos el método `toPromise()` y aseguramos que el valor retornado es booleano
      return await this.getResultadosPorId2(userId, sessionId, activityId).toPromise() ?? false;
    } catch (error) {
      console.warn(`Error al obtener resultados para usuario ${userId}, sesión ${sessionId}, actividad ${activityId}.`);
      return false;
    }
}

//

	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(`${operation} failed: ${error.message}`);
			// Devuelve un observable con un valor de resultado predeterminado.
			return of(result as T);
		};
	}
}
