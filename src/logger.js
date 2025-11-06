// src/logger.js
// PATRÓN: Singleton
// Líneas: 1 - 200 (archivo pequeño)
// Breve: Logger singleton reutilizable en toda la aplicación.
// Explicación: Exporta getLogger() que siempre devuelve la misma instancia.

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
  }

  setLevel(level) {
    this.level = level;
  }

  info(...args) {
    if (['info', 'debug'].includes(this.level)) console.log('[INFO]', ...args);
  }

  debug(...args) {
    if (this.level === 'debug') console.debug('[DEBUG]', ...args);
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
  }
}

let instance = null;
function getLogger() {
  if (!instance) instance = new Logger();
  return instance;
}

module.exports = { getLogger };
