const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session'); // Añadir express-session
const MySQLStore = require('express-mysql-session')(session);

const app = express();

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const dbOptions = {
    host: 'localhost',
    database: 'proyecto',
    user: 'root',
    password: 'Micasa71'
};

const conexion = mysql.createConnection(dbOptions);

// Configuración de la sesión usando MySQL
const sessionStore = new MySQLStore({}, conexion);

app.use(session({
    secret: 'your-secret-key', // Cambia esto a una clave secreta segura
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Usa el almacén de sesiones de MySQL
    cookie: { secure: false } // En producción, usa secure: true con HTTPS
}));

const PUERTO = 3000;
const SECRET_KEY = 'en un lugar de la mancha';

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto ${PUERTO}`);
});

conexion.connect(error => {
    if (error) throw error;
    console.log('Conexión exitosa a la base de datos');
});

// Rutas de ejemplo
app.get('/', (req, res) => {
    res.send('API funciona');
});

/// Endpoint para registrar un nuevo usuario
// app.post('/register', (req, res) => {
//     try {
//         // Hash del password
//         const hashedPassword = bcrypt.hashSync(req.body.password, 12);

//         // Datos del usuario
//         const user = {
//             email: req.body.email,
//             username: req.body.username,
//             password: hashedPassword,
//             first_name: req.body.first_name,
//             last_name: req.body.last_name,
//             is_superuser: req.body.is_superuser || 0,
//             is_staff: req.body.is_staff || 2,
//             is_active: req.body.is_active || 1,
//             date_joined: new Date()
//         };

//         // Inserción en la base de datos
//         const query = 'INSERT INTO auth_user SET ?';
//         conexion.query(query, user, (error, result) => {
//             if (error) {
//                 return res.json({ error: error.message });
//             }

//             res.json({ message: 'Usuario registrado con éxito', userId: result.insertId });
//         });

//     } catch (error) {
//         res.json({ error: error.message });
//     }
// });

// // Endpoint para login de usuario
// app.post('/iniciarsesion', async (req, res) => {
//     const { username, password } = req.body;

//     // Consulta para encontrar el usuario por email
//     const query = 'SELECT * FROM auth_user WHERE username = ?';
//     conexion.query(query, [username], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error en el servidor' });
//         }

//         if (results.length === 0) {
//             return res.json({ error: 'Error en usuario/contraseña' });
//         }

//         const user = results[0];

//         // Comparar la contraseña
//         const eq = bcrypt.compareSync(password, user.password);
//         if (!eq) {
//             return res.json({ error: 'Error en usuario/contraseña' });
//         }

//         // Generar el token
//         const token = createToken(user);

//         // Decodificar el token para obtener el ID
//         const decodedToken = jwt.verify(token, SECRET_KEY);

//         // Enviar respuesta con el ID decodificado
//         res.json({
//             success: 'Login correcto',
//             token: token,
//             userId: decodedToken.user_id
//         });
//     });
// });

// function createToken(user) {
//     const payload = {
//         user_id: user.id,
//         user_role: user.is_staff
//     };
//     return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Agrega una fecha de expiración si es necesario
// }




// app.get('/usuarios', (req, res) => {
//     const query = `SELECT * FROM auth_user;`;
//     conexion.query(query, (error, resultado) => {
//         if (error) return console.error(error.message);

//         if (resultado.length > 0) {
//             res.json(resultado);
//         } else {
//             res.json(`No hay registros`);
//         }
//     });
// });

// app.get('/usuarios/:id', (req, res) => {
//     const { id } = req.params;

//     const query = `SELECT * FROM auth_user WHERE id=${id};`;
//     conexion.query(query, (error, resultado) => {
//         if (error) return console.error(error.message);

//         if (resultado.length > 0) {
//             res.json(resultado);
//         } else {
//             res.json(`No hay registros`);
//         }
//     });
// });

// app.post('/usuarios/agregar', (req, res) => {
//     const usuario = {
//         first_name: req.body.first_name,
//         password: req.body.password,
//         username: req.body.username,
//         is_superuser: req.body.is_superuser,
//         last_name: req.body.last_name,
//         is_staff: req.body.is_staff,
//         is_active: req.body.is_active,
//         date_joined: req.body.date_joined,
//         email: req.body.email
//     };

//     const query = `INSERT INTO auth_user SET ?`;
//     conexion.query(query, usuario, (error) => {
//         if (error) return console.error(error.message);

//         res.json(`Se actualizó correctamente el usuario\n${usuario.first_name},---${usuario.email}`);
//     });
// });

// app.put('/usuarios/actualizar/:id', (req, res) => {
//     const { id } = req.params;
//     const { first_name, email } = req.body;

//     const query = `UPDATE auth_user SET first_name='${first_name}', email='${email}' WHERE id='${id}';`;
//     conexion.query(query, (error) => {
//         if (error) return console.error(error.message);

//         res.json(`Se actualizó correctamente el usuario\n${first_name}, ${email}`);
//     });
// });

// app.delete('/usuarios/borrar/:id', (req, res) => {
//     const { id } = req.params;

//     const query = `DELETE FROM auth_user WHERE id=${id};`;
//     conexion.query(query, (error) => {
//         if (error) console.error(error.message);

//         res.json(`Se eliminó correctamente el usuario`);
//     });
// });
