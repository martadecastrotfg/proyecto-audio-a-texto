export class Item {
  id: string;
  value: string;
  order_in_activity: number;
  activity: string;
  activityName?: string;  // Añadir esta línea

  constructor(id: string, value: string, order_in_activity: number, activity: string) {
    this.id = id;
    this.value = value;
    this.order_in_activity = order_in_activity;
    this.activity = activity;
  }
}
