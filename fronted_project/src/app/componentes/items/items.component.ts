import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../dataservice/data.service';
import { Usuario } from '../../dataservice/usuario';
import { Emitters } from '../../emitters/emmiters';
import { Actividades } from '../../dataservice/actividad';
import { Item } from '../../dataservice/item';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  activityType: string = '';  // Tipo de actividad seleccionado (Texto Completo o Palabras Sueltas)
  selectedActivityId: string = '';  // ID de la actividad seleccionada
  orderInActivity: number | undefined;  // Orden en la actividad
  itemValue: string = '';  // Valor del item
  activities: Actividades[] = [];  // Lista de actividades para el selector
  filteredActivities: Actividades[] = [];  // Actividades filtradas según el tipo seleccionado
  items: Item[] = [];  // Lista de items existentes

  user?: Usuario;
  userId: number | null = null;
  userLoginOn: boolean = false;

  // Objeto para mapear IDs de actividades a nombres
  activityNames: { [id: string]: string } = {};

  private apiUrl = 'http://localhost:8000/crearitems/'; // URL para la API de items
  private apiUrl2 = 'http://localhost:8000/item/'; // URL para la API de items

  private activitiesUrl = 'http://localhost:8000/actividad/'; // URL para la API de actividades

  constructor(private http: HttpClient, private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8000/user', { withCredentials: true }).subscribe(
      (res: any) => {
        this.user = res;
        if (this.user) {
          this.userId = this.user.id;
          this.userLoginOn = true;
          this.loadActivities();
          this.loadItems();
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
    this.http.get<Actividades[]>(this.activitiesUrl)
      .subscribe(data => {
        this.activities = data;
        this.updateFilteredActivities();  // Filtrar actividades iniciales
      }, error => {
        console.error('Error al cargar actividades', error);
      });
  }

  loadItems(): void {
    this.http.get<Item[]>(this.apiUrl2)
      .subscribe(data => {
        this.items = data;
        this.updateActivityNames(); // Actualiza los nombres de las actividades
      }, error => {
        console.error('Error al cargar items', error);
      });
  }

  onActivityTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.activityType = selectElement.value;
    this.updateFilteredActivities();  // Actualizar actividades filtradas según el tipo
  }

  updateFilteredActivities(): void {
    this.filteredActivities = this.activities.filter(activity => activity.type === this.activityType);
    if (this.activityType === '') {
      this.filteredActivities = this.activities;
    }
    this.updateActivityNames(); // Actualizar nombres después de filtrar
  }

  updateActivityNames(): void {
    this.activityNames = this.activities.reduce((acc, activity) => {
      acc[activity.id] = activity.name;
      return acc;
    }, {} as { [id: string]: string });
  
    this.items = this.items.map(item => ({
      ...item,
      activityName: this.activityNames[item.activity] || 'Desconocida'  // Asignar activityName aquí
    }));
  }
  
  

  onItemSubmit(): void {
    if (!this.userId) {
      console.error('ID del usuario no disponible');
      return;
    }
  
    if (!this.selectedActivityId || this.orderInActivity === undefined || !this.itemValue) {
      console.error('Campos requeridos faltantes');
      return;
    }
  
    const newItem = {
      activity: this.selectedActivityId,
      order_in_activity: this.orderInActivity,
      value: this.itemValue,
    };
  
    console.info(newItem);
  
    this.http.post(this.apiUrl, newItem, { headers: { 'Content-Type': 'application/json' } })
      .subscribe({
        next: (response) => {
          console.log('Item creado con éxito', response);
          this.loadItems();  // Recargar la lista de items
          this.resetForm();  // Opcional: resetear el formulario
        },
        error: (error) => {
          console.error('Error al crear item', error);
          console.error('Error details:', error.error);
        }
      });
  }

  resetForm(): void {
    this.selectedActivityId = '';
    this.orderInActivity = undefined;
    this.itemValue = '';
  }
}
