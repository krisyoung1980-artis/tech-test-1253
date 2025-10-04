import type { SpreadsheetState } from "../types/spreadsheet";

export function resolveCellReference(
  cellRef: string,
  spreadsheet: SpreadsheetState
): number {
  const normalizedRef = cellRef.toUpperCase();
  const cellValue = spreadsheet[normalizedRef]?.computedValue;

  if (typeof cellValue === "number") {
    return cellValue;
  }

  if (typeof cellValue === "string" && cellValue !== "") {
    const parsed = parseFloat(cellValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function substituteCellReferences(
  expression: string,
  spreadsheet: SpreadsheetState
): string {
  return expression.replace(/[A-Za-z]\d+/gi, (match) => {
    const value = resolveCellReference(match, spreadsheet);
    return value.toString();
  });
}

const tokenize = (expression: string): string[] =>
  expression.replace(/\s/g, "").match(/\d+\.?\d*|[+\-*/]/g) || [];

const evaluate = (tokens: string[]): number => {
  // Find lowest precedence operator (+ or -) from right to left
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i] === "+" || tokens[i] === "-") {
      const left = evaluate(tokens.slice(0, i));
      const right = evaluate(tokens.slice(i + 1));
      return tokens[i] === "+" ? left + right : left - right;
    }
  }

  // Find next precedence operator (* or /) from right to left
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i] === "*" || tokens[i] === "/") {
      const left = evaluate(tokens.slice(0, i));
      const right = evaluate(tokens.slice(i + 1));
      if (tokens[i] === "/") {
        if (right === 0) throw new Error("Division by zero");
        return left / right;
      }
      return left * right;
    }
  }

  if (tokens[0] === "-") {
    return -evaluate(tokens.slice(1));
  }

  if (tokens[0] === "+") {
    return evaluate(tokens.slice(1));
  }

  return parseFloat(tokens[0]);
};

export function evaluateFormula(
  formula: string,
  spreadsheet: SpreadsheetState
): string | number {
  if (!formula.startsWith("=")) {
    return formula;
  }

  try {
    const expression = formula.slice(1);
    const exprWithValues = substituteCellReferences(expression, spreadsheet);
    const tokens = tokenize(exprWithValues);
    const result = evaluate(tokens);

    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result;
    }

    return "#ERROR";
  } catch {
    return "#ERROR";
  }
}
