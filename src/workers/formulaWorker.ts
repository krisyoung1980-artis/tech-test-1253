import { evaluateFormula } from "../utils/formulaEvaluator";
import type { SpreadsheetState } from "../types/spreadsheet";

export interface WorkerMessage {
  cellId: string;
  rawInput: string; // e.g., "=A1+B2"
  spreadsheet: SpreadsheetState;
}

export interface WorkerResponse {
  cellId: string;
  computedValue: string | number;
}

self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const { cellId, rawInput, spreadsheet } = event.data;

  console.log(`[Worker] Evaluating ${cellId}: ${rawInput}`);

  // Use the utility function to evaluate the formula
  const computedValue = evaluateFormula(rawInput, spreadsheet);

  console.log(`[Worker] Result for ${cellId}: ${computedValue}`);

  const response: WorkerResponse = { cellId, computedValue };
  self.postMessage(response);
});
