export class Usuario {
    id: number;
    username: string;
    username_glifing?: string; // Optional field
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string; // Optional field
    password: string;
    rol: string;
    is_admin: boolean;
    is_active: boolean;
    is_staff: boolean;
    last_login?: Date; // Optional field, using Date for datetime fields
    curso?: number

    constructor(
        id: number,
        username: string,
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        rol: string,
        is_admin: boolean,
        is_active: boolean,
        is_staff: boolean,
        username_glifing?: string,
        avatar?: string,
        last_login?: Date,
        curso?: number

    ) {
        this.id = id;
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.is_admin = is_admin;
        this.is_active = is_active;
        this.is_staff = is_staff;
        this.username_glifing = username_glifing;
        this.avatar = avatar;
        this.last_login = last_login;
        this.curso= curso;
    }
}
