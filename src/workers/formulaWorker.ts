import { evaluateFormula } from "../utils/formulaEvaluator";
import type { SpreadsheetState } from "../types/spreadsheet";

export interface WorkerMessage {
  cellId: string;
  rawInput: string; // e.g., "=A1+B2"
  spreadsheet: SpreadsheetState;
}

export interface WorkerResponse {
  cellId: string;
  rawInput: string;
  computedValue: string | number;
}

self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const { cellId, rawInput, spreadsheet } = event.data;

  const computedValue = evaluateFormula(rawInput, spreadsheet);

  const response: WorkerResponse = { cellId, rawInput, computedValue };
  self.postMessage(response);
});
