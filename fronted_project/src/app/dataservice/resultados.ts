export class Resultados {
    id: string;  // Ajusta el tipo según tu backend, puede ser 'number' o 'string'
    activity_id: string;  // ID de la actividad relacionada
    datetime: string;  // Fecha y hora del resultado, usa 'Date' si prefieres
    task: any;  // Ajusta según la estructura de tu tarea; puede ser otro objeto o tipo
  
    constructor(
      id: string,
      activity_id: string,
      datetime: string,
      task: any
    ) {
      this.id = id;
      this.activity_id = activity_id;
      this.datetime = datetime;
      this.task = task;
    }
  }
  