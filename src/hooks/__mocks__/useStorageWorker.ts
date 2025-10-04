import type { SpreadsheetState } from "../../types/spreadsheet";

const DB_NAME = "spreadsheet-db";
const STORE_NAME = "state";
const STATE_KEY = "spreadsheet-state";

// In-memory storage for tests since IndexedDB isn't always available
const mockStorage = new Map<string, SpreadsheetState>();

export function useStorageWorker() {
  const loadState = async (): Promise<SpreadsheetState | undefined> => {
    try {
      return mockStorage.get(STATE_KEY);
    } catch (error) {
      console.error("Failed to load state from mock storage:", error);
      return undefined;
    }
  };

  const saveState = async (state: SpreadsheetState): Promise<void> => {
    try {
      mockStorage.set(STATE_KEY, state);
    } catch (error) {
      console.error("Failed to save state to mock storage:", error);
    }
  };

  return { loadState, saveState };
}
