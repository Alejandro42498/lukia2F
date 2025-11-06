const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sequelize = require('./config/database');
const cron = require('node-cron');

// --- Modelos ---
const User = require('./models/User');

// --- Servicios ---
const { updateCryptos } = require('./services/cryptosUpdate.service');

const app = express();

// 🧩 Middleware base (debe ir antes de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: false,
  })
);

// ⚙️ Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 Rutas
const viewRoutes = require('./routes/views.routes');
const userRoutes = require('./routes/users.routes');
const indexRouter = require('./routes/index');
const dashboardRoutes = require('./routes/dashboard.routes');
const tradesRoutes = require('./routes/trades.routes');

// ✅ Usa las rutas después de configurar sesión
app.use('/', viewRoutes);
app.use('/api/users', userRoutes);
app.use('/', indexRouter);
// Rutas adicionales
app.use('/dashboard', dashboardRoutes);
app.use('/api/trades', tradesRoutes);

// 🔄 Sincronización BD y CRON
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Base de datos sincronizada correctamente');
    updateCryptos(); // inicial
    cron.schedule('0 */12 * * *', async () => {
      await updateCryptos();
    });
  })
  .catch((err) => console.error('❌ Error al sincronizar BD:', err));

module.exports = app;
