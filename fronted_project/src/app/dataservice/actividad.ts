// actividad.ts
import { Item } from './item';  // Asegúrate de que la ruta sea correcta

export class Actividades {
  id: number;
  name: string;
  description: string;
  instruction: string;
  order_in_session: number;
  task_id: string;
  type: 'texto_completo' | 'palabras_sueltas';
  items: Item[];
  completed: boolean;  // Agrega esta línea para indicar si la actividad está completada
  
  constructor(
    id: number,
    name: string,
    description: string,
    instruction: string,
    order_in_session: number,
    task_id: string,
    type: 'texto_completo' | 'palabras_sueltas',
    items: Item[],
    completed: boolean  // Agrega esta línea para el parámetro del constructor
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.instruction = instruction;
    this.order_in_session = order_in_session;
    this.task_id = task_id;
    this.type = type;
    this.items = items;
    this.completed = completed;  // Inicializa la propiedad en el constructor
  }
}

export { Item };  // Asegúrate de exportar Item también

