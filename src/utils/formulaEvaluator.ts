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

    // Note: Using eval here is not ideal but acceptable for this demo
    // In production, use a proper expression parser
    // eslint-disable-next-line no-eval
    const result = eval(exprWithValues);

    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result;
    }

    if (typeof result === "string") {
      return result;
    }

    return "#ERROR";
  } catch {
    return "#ERROR";
  }
}
