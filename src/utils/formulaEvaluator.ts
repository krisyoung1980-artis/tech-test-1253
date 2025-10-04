import type { SpreadsheetState } from "../types/spreadsheet";
import { logger } from "./logger";
import { DivisionByZeroError, FormulaTooComplexError } from "./errors";

const MAX_RECURSION_DEPTH = 50;
const ERROR_VALUE = "#ERROR";

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
  spreadsheet: SpreadsheetState,
  visitedCells = new Set<string>()
): string {
  return expression.replace(/[A-Z]\d+/gi, (match) => {
    const normalizedRef = match.toUpperCase();

    if (visitedCells.has(normalizedRef)) {
      logger.error(`Circular reference detected: ${normalizedRef}`);
      return "0";
    }

    visitedCells.add(normalizedRef);
    const value = resolveCellReference(normalizedRef, spreadsheet);
    return value.toString();
  });
}

const tokenize = (expression: string): string[] =>
  expression.replace(/\s/g, "").match(/\d+\.?\d*|[+\-*/]/g) || [];

const isAddOrSubtract = (token: string): boolean =>
  token === "+" || token === "-";

const isMultiplyOrDivide = (token: string): boolean =>
  token === "*" || token === "/";

const findOperator = (
  tokens: string[],
  predicate: (token: string) => boolean
): number => tokens.findLastIndex(predicate);

const applyAddOrSubtract = (
  operator: string,
  left: number,
  right: number
): number => (operator === "+" ? left + right : left - right);

const applyMultiplyOrDivide = (
  operator: string,
  left: number,
  right: number
): number => {
  if (operator === "/") {
    if (right === 0) throw new DivisionByZeroError();
    return left / right;
  }
  return left * right;
};

const handleUnary = (tokens: string[], depth: number): number | null => {
  if (tokens[0] === "-") return evaluate(tokens.slice(1), depth + 1) * -1;
  if (tokens[0] === "+") return evaluate(tokens.slice(1), depth + 1);
  return null;
};

const evaluate = (tokens: string[], depth = 0): number => {
  if (depth > MAX_RECURSION_DEPTH) {
    throw new FormulaTooComplexError();
  }

  const addSubIndex = findOperator(tokens, isAddOrSubtract);
  if (addSubIndex !== -1) {
    const left = evaluate(tokens.slice(0, addSubIndex), depth + 1);
    const right = evaluate(tokens.slice(addSubIndex + 1), depth + 1);
    return applyAddOrSubtract(tokens[addSubIndex], left, right);
  }

  const mulDivIndex = findOperator(tokens, isMultiplyOrDivide);
  if (mulDivIndex !== -1) {
    const left = evaluate(tokens.slice(0, mulDivIndex), depth + 1);
    const right = evaluate(tokens.slice(mulDivIndex + 1), depth + 1);
    return applyMultiplyOrDivide(tokens[mulDivIndex], left, right);
  }

  const unaryResult = handleUnary(tokens, depth);
  if (unaryResult !== null) return unaryResult;

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

    return ERROR_VALUE;
  } catch (error) {
    logger.error("Error evaluating formula:", formula, error);
    return ERROR_VALUE;
  }
}
