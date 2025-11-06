// src/cryptoEvents.js
// PATRÓN: Observer (Subject/Observers)
// Líneas: 1 - 200 (archivo pequeño)
// Breve: Subject para notificar actualizaciones de criptomonedas.
// Explicación: Otros módulos pueden subscribirse al objeto `cryptoUpdates`
// y recibir notificaciones cuando se invoque `cryptoUpdates.notify(data)`.

class Subject {
  constructor() {
    this.observers = new Set();
  }

  subscribe(fn) {
    this.observers.add(fn);
  }

  unsubscribe(fn) {
    this.observers.delete(fn);
  }

  notify(data) {
    for (const obs of this.observers) {
      try {
        obs(data);
      } catch (err) {
        // no dejar que un observer interrumpa al resto
        console.error('Observer error:', err);
      }
    }
  }
}

const cryptoUpdates = new Subject();

module.exports = { cryptoUpdates };
