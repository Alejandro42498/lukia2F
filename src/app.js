const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: false
}));

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Conexión y sincronización de BD
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Base de datos sincronizada correctamente'))
  .catch(err => console.error('❌ Error al sincronizar BD:', err));

// Ruta para registrar usuario
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: '✅ Usuario registrado exitosamente',
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('⚠️ Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const userRoutes = require('./routes/users.routes');
app.use('/api/users', userRoutes);


// Ruta principal
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

module.exports = app;
