// src/feeStrategies.js
// PATRÓN: Strategy
// Líneas: 1 - 200 (archivo pequeño)
// Breve: Define estrategias para calcular comisiones (porcentaje / fija).
// Explicación: Permite intercambiar la lógica de cálculo de comisiones sin tocar el código que
// crea transacciones; usar FeeContext para aplicar la estrategia elegida.

class PercentageFeeStrategy {
  constructor(percent = 0.005) {
    // 0.5% por defecto
    this.percent = percent;
  }

  calculate(amount) {
    return Number(amount) * this.percent;
  }
}

class FlatFeeStrategy {
  constructor(flat = 1.0) {
    this.flat = flat;
  }

  calculate(/* amount */) {
    return this.flat;
  }
}

class FeeContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculate(amount) {
    if (!this.strategy) throw new Error('No fee strategy set');
    return this.strategy.calculate(amount);
  }
}

module.exports = { PercentageFeeStrategy, FlatFeeStrategy, FeeContext };
