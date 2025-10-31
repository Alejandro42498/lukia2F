const path = require('path');

// ✅ Cargar variables de entorno desde la raíz del proyecto (lukia2F/.env)
const envPath = path.resolve(__dirname, '../../.env');
const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.error('⚠️  No se pudo cargar .env en:', envPath);
} else {
  console.log('✅ .env cargado desde:', envPath);
}

const sequelize = require('./database');

// 🧩 Función para ocultar la contraseña en los logs
function mask(value) {
  if (!value) return '(vacío)';
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '***' + value.slice(-2);
}

// 📋 Mostrar variables cargadas
console.log('🔎 Variables leídas de .env:');
console.log('  PGHOST       =', process.env.PGHOST || '(vacío)');
console.log('  PGPORT       =', process.env.PGPORT || '(vacío)');
console.log('  PGDATABASE   =', process.env.PGDATABASE || '(vacío)');
console.log('  PGUSER       =', process.env.PGUSER || '(vacío)');
console.log('  PGPASSWORD   =', mask(process.env.PGPASSWORD));
console.log('  PGSSLMODE    =', process.env.PGSSLMODE || '(vacío)');

// 🚀 Probar conexión a la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente con la base de datos.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error('  name:', error?.name);
    console.error('  message:', error?.message);
    if (error?.original) {
      console.error('  original.code:', error.original.code);
      console.error('  original.message:', error.original.message);
    }
    if (error?.parent) {
      console.error('  parent.code:', error.parent.code);
      console.error('  parent.message:', error.parent.message);
    }
    console.error('  stack:', error?.stack?.split('\n')[0]);
  } finally {
    try { await sequelize.close(); } catch (_) {}
  }
})();
