window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const tablaUsuarios = document.getElementById('tablaUsuarios');
    if (tablaUsuarios) {
        new simpleDatatables.DataTable(tablaUsuarios);
    }
});

let listaUsuarios = []; // Variable para almacenar la lista de usuarios


const formulario = document.querySelector('#formulario');

formulario.addEventListener('submit', validarFormulario);

function validarFormulario(e) {
    e.preventDefault();
    const user = document.querySelector('#user').value;
    const nombre = document.querySelector('#nombre').value;
    const correo = document.querySelector('#correo').value;
    const roles = document.querySelector('#rol').value;
    const usernameGlifing = document.querySelector('#usernameGlifing').value;
    const apellido = document.querySelector('#apellido').value;
    const password = document.querySelector('#password').value;
    const avatar = document.querySelector('#avatar').value;

    if (user.trim() === '' || nombre.trim() === '' || correo.trim() === '' || roles.trim() === '') {
        alert('Todos los campos se deben llenar');
        return;
    }

    agregarUsuarioTabla(user, usernameGlifing, nombre, apellido, correo, roles, password,avatar);

    formulario.reset();
}

document.querySelector('#rol').addEventListener('change', function() {
    const camposEntrenado = document.getElementById('camposEntrenado');
    // Mostrar u ocultar los campos de entrenamiento según el rol seleccionado
    camposEntrenado.style.display = this.value === 'entrenado' ? 'block' : 'none';
});

document.querySelector('#btnAgregarEntrenamiento').addEventListener('click', function() {
    const entrenamientos = document.getElementById('entrenamientos');
    // Clonar la plantilla de entrenamiento
    const plantilla = document.querySelector('.entrenamiento');
    const nuevoEntrenamiento = plantilla.cloneNode(true);
    // Limpiar los campos clonados
    nuevoEntrenamiento.querySelector('.cursoId').value = '';
    nuevoEntrenamiento.querySelector('.fechaEntrenamiento').value = '';
    // Agregar el nuevo entrenamiento al contenedor
    entrenamientos.appendChild(nuevoEntrenamiento);
});

document.getElementById('entrenamientos').addEventListener('click', function(event) {
    if (event.target.classList.contains('btnEliminarEntrenamiento')) {
        event.target.closest('.entrenamiento').remove(); // Eliminar el entrenamiento
    }
});


// function agregarUsuarioTabla(user, nombre, correo, roles) {
function agregarUsuarioTabla (user, usernameGlifing, nombre, apellido, correo, roles, password,avatar){

    const tablaUsuarios = document.getElementById('tablaUsuarios').getElementsByTagName('tbody')[0];
    const fila = tablaUsuarios.insertRow();

    // Nueva celda de selección
    const celdaSeleccion = fila.insertCell(0);
    const checkboxSeleccion = document.createElement('input');
    checkboxSeleccion.type = 'checkbox';
    celdaSeleccion.appendChild(checkboxSeleccion);

    const celdaUser = fila.insertCell(1);
    const celdaUserGlig = fila.insertCell(2);
    const celdaNombre = fila.insertCell(3);
    const celdaApellido = fila.insertCell(4);
    const celdaCorreo = fila.insertCell(5);
    const celdaAvatar = fila.insertCell(6);
    const celdaRoles = fila.insertCell(7);
    const celdaAcciones = fila.insertCell(8);

    celdaUser.textContent = user;
    celdaUserGlig.textContent = usernameGlifing;
    celdaApellido.textContent = apellido;
    celdaNombre.textContent = nombre;
    celdaCorreo.textContent = correo;
    celdaAvatar.textContent = avatar;
    celdaRoles.textContent = roles;

    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar';
    botonEditar.onclick = () => cargarUsuario(user, nombre, correo, roles);
    // botonEditar.classList.add('btn-editar'); // Añadir clase CSS
    celdaAcciones.appendChild(botonEditar);

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.onclick = () => confirmarEliminar(user);
    // botonEliminar.classList.add('btn-borrar'); // Añadir clase CSS
    celdaAcciones.appendChild(botonEliminar);

    const botonVer = document.createElement('button');
    botonVer.textContent = 'Ver';
    botonVer.onclick = () => mostrarInformacion(user, nombre, correo, roles);
    celdaAcciones.appendChild(botonVer);
}

function mostrarInformacion(user, nombre, correo, roles) {
    // Obtener los valores de los campos del formulario
    const username = document.querySelector('#username').value;
    const usernameGlifing = document.querySelector('#usernameGlifing').value;
    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;
    const password = document.querySelector('#password').value;
    const avatar = document.querySelector('#avatar').value;
    const rol = document.querySelector('#rol').value;
    let camposEntrenado = '';

    // Verificar si se ha seleccionado el rol de "entrenado"
    if (rol === 'entrenado') {
        // Mostrar los campos adicionales para entrenados
        const cursoId = document.querySelector('.cursoId').value;
        const fechaEntrenamiento = document.querySelector('.fechaEntrenamiento').value;
        camposEntrenado = `
            <div class="col-md-6">
                <p><strong>ID del Curso:</strong> ${cursoId}</p>
                <p><strong>Fecha de Entrenamiento:</strong> ${fechaEntrenamiento}</p>
            </div>
        `;
    }

    // Construir el HTML para mostrar la información detallada del usuario
    const detalleHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Nombre de Usuario:</strong> ${user}</p>
                <p><strong>Nombre Completo:</strong> ${nombre}</p>
                <p><strong>Correo Electrónico:</strong> ${correo}</p>
                <p><strong>Roles:</strong> ${roles}</p>
                <p><strong>Nombre de Usuario (nombre.apellido):</strong> ${username}</p>
                <p><strong>Usuario Glifing (opcional):</strong> ${usernameGlifing}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Nombre:</strong> ${firstName}</p>
                <p><strong>Apellidos:</strong> ${lastName}</p>
                <p><strong>Contraseña:</strong> ${password}</p>
                <p><strong>Avatar:</strong> ${avatar}</p>
                <p><strong>Rol Seleccionado:</strong> ${rol}</p>
                ${camposEntrenado}
            </div>
        </div>
    `;

    // Mostrar la información detallada del usuario en la pantalla
    const infoUsuario = document.getElementById('infoUsuario');
    infoUsuario.innerHTML = detalleHTML;
    document.getElementById('detalleUsuario').style.display = 'block'; // Mostrar la sección de detalle del usuario
}



function cargarUsuario(user, nombre, correo, roles) {
    
    // Obtener los valores de los campos del formulario
    const username = document.querySelector('#username').value;
    const usernameGlifing = document.querySelector('#usernameGlifing').value;
    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;
    const password = document.querySelector('#password').value;
    const avatar = document.querySelector('#avatar').value;
    const rol = document.querySelector('#rol').value;
    let camposEntrenado = '';

    // Verificar si se ha seleccionado el rol de "entrenado"
    if (rol === 'entrenado') {
        // Mostrar los campos adicionales para entrenados
        const cursoId = document.querySelector('.cursoId').value;
        const fechaEntrenamiento = document.querySelector('.fechaEntrenamiento').value;
        camposEntrenado = `
            <div class="col-md-6">
                <label for="cursoId">ID del Curso:</label>
                <input type="text" class="form-control" id="cursoId" value="${cursoId}">
                <label for="fechaEntrenamiento">Fecha de Entrenamiento:</label>
                <input type="date" class="form-control" id="fechaEntrenamiento" value="${fechaEntrenamiento}">
            </div>
        `;
    }

    // Construir el HTML para mostrar los campos de edición de la información del usuario
    const edicionHTML = `
        <div class="row">
            <div class="col-md-6">
                <label for="user">Nombre de Usuario:</label>
                <input type="text" class="form-control" id="user" value="${user}">
                <label for="nombre">Nombre Completo:</label>
                <input type="text" class="form-control" id="nombre" value="${nombre}">
                <label for="correo">Correo Electrónico:</label>
                <input type="email" class="form-control" id="correo" value="${correo}">
                <label for="rol">Roles:</label>
                <select class="form-select" id="rol">
                    <option value="administrador" ${rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                    <option value="editor" ${rol === 'editor' ? 'selected' : ''}>Editor</option>
                    <option value="entrenado" ${rol === 'entrenado' ? 'selected' : ''}>Entrenado</option>
                </select>
                <label for="username">Nombre de Usuario (nombre.apellido):</label>
                <input type="text" class="form-control" id="username" value="${username}">
                <label for="usernameGlifing">Usuario Glifing (opcional):</label>
                <input type="text" class="form-control" id="usernameGlifing" value="${usernameGlifing}">
            </div>
            <div class="col-md-6">
                <label for="firstName">Nombre:</label>
                <input type="text" class="form-control" id="firstName" value="${firstName}">
                <label for="lastName">Apellidos:</label>
                <input type="text" class="form-control" id="lastName" value="${lastName}">
                <label for="password">Contraseña:</label>
                <input type="password" class="form-control" id="password" value="${password}">
                <label for="avatar">Avatar:</label>
                <input type="file" class="form-control" id="avatar" accept="image/*" value="${avatar}">
                ${camposEntrenado}
            </div>
        </div>
    `;

    // Mostrar los campos de edición de la información del usuario en la pantalla
    const infoEdicionUsuario = document.getElementById('infoEdicionUsuario');
    infoEdicionUsuario.innerHTML = edicionHTML;
    document.getElementById('edicionUsuario').style.display = 'block'; // Mostrar la sección de edición del usuario
}
    


// Función para confirmar la eliminación de un usuario
function confirmarEliminar(user) {
    if (confirm(`¿Estás seguro que deseas eliminar al usuario ${user}?`)) {
        eliminarUsuarioTabla(user);
    }
}

// Función para eliminar un usuario de la tabla
function eliminarUsuarioTabla(user) {
    const tablaUsuarios = document.getElementById('tablaUsuarios').getElementsByTagName('tbody')[0];
    const filas = tablaUsuarios.getElementsByTagName('tr');

    for (let fila of filas) {
        if (fila.cells[1].textContent === user) {
            fila.remove();
            break;
        }
    }
}
