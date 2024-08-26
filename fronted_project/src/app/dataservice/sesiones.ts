import { Actividades } from './actividad'; // Asegúrate de que el nombre y la ruta sean correctos
import { Resultados } from './resultados'; // Asegúrate de que el nombre y la ruta sean correctos

export class TrainingSession {
  id: number;
  name: string;
  session_id: string;
  description: string;
  status: string;
  created_user?: number; // Si no es necesario en la creación, puede ser opcional
  modified_user?: number; // Si no es necesario en la creación, puede ser opcional
  created_datetime?: string; // Utiliza 'string' para la fecha en formato ISO
  modified_datetime?: string; // Utiliza 'string' para la fecha en formato ISO
  activities?: Actividades[];
  results?: Resultados[];
  completed_activities?: number;
  total_activities?: number;

  constructor(
    id: number,
    name: string,
    session_id: string,
    description: string,
    status: string,
    activities?: Actividades[],
    results?: Resultados[],
    created_user?: number,
    modified_user?: number,
    created_datetime?: string,
    modified_datetime?: string
  ) {
    this.id = id;
    this.name = name;
    this.session_id = session_id;
    this.description = description;
    this.status = status;
    this.activities = activities;
    this.results = results;
    this.completed_activities = activities?.filter(a => a.completed).length || 0;
    this.total_activities = activities?.length || 0;
    this.created_user = created_user;
    this.modified_user = modified_user;
    this.created_datetime = created_datetime;
    this.modified_datetime = modified_datetime;
  }
}
