// src/index.js
const http = require('http');
const app = require('./app');
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Intentar arrancar en PORT, si está en uso probar el siguiente puerto (hasta +10)
async function attemptStart(port, attemptsLeft = 10) {
  const server = http.createServer(app);

  server.on('listening', () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Puerto ${port} en uso. Intentando puerto ${port + 1}...`);
      if (attemptsLeft > 0) {
        // Esperar un momento antes de reintentar para evitar loops rápidos
        setTimeout(() => attemptStart(port + 1, attemptsLeft - 1), 300);
      } else {
        console.error('No se pudo encontrar un puerto disponible. Salida.');
        process.exit(1);
      }
    } else {
      console.error('Error al iniciar el servidor:', err);
      process.exit(1);
    }
  });

  server.listen(port);
}

attemptStart(DEFAULT_PORT);
