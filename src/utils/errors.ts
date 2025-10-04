export class DivisionByZeroError extends Error {
  constructor() {
    super("Division by zero");
    this.name = "DivisionByZeroError";
  }
}

export class FormulaTooComplexError extends Error {
  constructor() {
    super("Formula too complex");
    this.name = "FormulaTooComplexError";
  }
}
