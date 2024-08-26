import internal from "stream";

export class UsuarioModel {

    constructor(
      public id: string,
      public password: string,
      public email: string,
      public last_login: Date,
      public is_superuser: number,
      public username: string,
      public first_name: string,
      public last_name: string,
      public is_staff: number,
      public is_active: number,
      public date_joined: string,


    ) { }
  
  }