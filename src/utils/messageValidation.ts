import type { BroadcastMessage, SpreadsheetState } from "../types/spreadsheet";

export interface WorkerMessage {
  cellId: string;
  rawInput: string;
  spreadsheet: SpreadsheetState;
}

export interface StorageMessage {
  type: "save" | "load";
  requestId: string;
  payload?: SpreadsheetState;
}

export const isValidWorkerMessage = (message: unknown): message is WorkerMessage => {
  if (!message || typeof message !== "object") return false;

  const msg = message as Partial<WorkerMessage>;
  return !!(
    msg.cellId &&
    typeof msg.rawInput === "string" &&
    msg.spreadsheet
  );
};

export const isValidBroadcastMessage = (message: unknown): message is BroadcastMessage => {
  if (!message || typeof message !== "object") return false;

  const msg = message as Partial<BroadcastMessage>;
  return !!(
    msg.cellId &&
    typeof msg.rawInput === "string" &&
    (msg.computedValue === 0 || msg.computedValue) &&
    typeof msg.timestamp === "number"
  );
};

export const isValidStorageMessage = (message: unknown): message is StorageMessage => {
  if (!message || typeof message !== "object") return false;

  const msg = message as Partial<StorageMessage>;
  if (!msg.type || (msg.type !== "save" && msg.type !== "load")) return false;
  if (typeof msg.requestId !== "string" || !msg.requestId) return false;
  if (msg.type === "save" && !msg.payload) return false;

  return true;
};
