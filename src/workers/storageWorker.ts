import type { SpreadsheetState } from "../types/spreadsheet";
import { logger } from "../utils/logger";
import { isValidStorageMessage } from "../utils/messageValidation";
import { saveToIndexedDB, loadFromIndexedDB } from "../utils/storage";

interface StorageResponse {
  type: "loaded" | "saved" | "error";
  requestId: string;
  payload?: SpreadsheetState;
  error?: string;
}

self.onmessage = async (event: MessageEvent) => {
  const message = event.data;

  if (!isValidStorageMessage(message)) {
    logger.error("Invalid message received by storage worker");
    return;
  }

  const { type, requestId, payload } = message;

  try {
    if (type === "save" && payload) {
      await saveToIndexedDB(payload);
      self.postMessage({ type: "saved", requestId } as StorageResponse);
    } else if (type === "load") {
      const stored = await loadFromIndexedDB();
      self.postMessage({
        type: "loaded",
        requestId,
        payload: stored,
      } as StorageResponse);
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    } as StorageResponse);
  }
};
