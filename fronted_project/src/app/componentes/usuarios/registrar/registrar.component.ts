import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../servicios/usuario/usuario.service';
import { first } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css'
})
export class RegistrarComponent {


  formulario: FormGroup;

  usersService = inject(UsuarioService);

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    this.formulario = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      username: new FormControl(),
      email: new FormControl(),
      password: new FormControl()
    })
  }

  // async onSubmit() {
  //   const response = await this.usersService.register(this.formulario.value);
  //   console.log(response);
  // }

  // ngOnInit(): void {
  //   this.formulario = this.formBuilder.group({
  //     first_name: '',
  //     last_name: '',
  //     email: '',
  //     username: '',
  //     password: ''
  //   });
  // }

  onSubmit(): void {
    this.http.post('http://localhost:8000/register', this.formulario.getRawValue())
      .subscribe(() => this.router.navigate(['/iniciarsesion']));
  }

}