import { evaluateFormula } from "../utils/formulaEvaluator";
import { isValidWorkerMessage } from "../utils/messageValidation";
import { logger } from "../utils/logger";

export interface WorkerResponse {
  cellId: string;
  rawInput: string;
  computedValue: string | number;
}

self.addEventListener("message", (event: MessageEvent) => {
  const message = event.data;

  if (!isValidWorkerMessage(message)) {
    logger.error("Invalid message format received by worker");
    return;
  }

  const { cellId, rawInput, spreadsheet } = message;
  const computedValue = evaluateFormula(rawInput, spreadsheet);

  const response: WorkerResponse = { cellId, rawInput, computedValue };
  self.postMessage(response);
});
