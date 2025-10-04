import { describe, it, expect, beforeEach, vi } from "vitest";
import { openDatabase, saveToIndexedDB, loadFromIndexedDB } from "../storage";
import type { SpreadsheetState } from "../../types/spreadsheet";

describe("storage", () => {
  let mockDB: any;
  let mockOpenRequest: any;
  let mockTransaction: any;
  let mockStore: any;
  let mockRequest: any;

  beforeEach(() => {
    // Reset mocks
    mockRequest = {
      onsuccess: null,
      onerror: null,
      result: undefined,
      error: null,
    };

    mockStore = {
      get: vi.fn(() => mockRequest),
      put: vi.fn(() => mockRequest),
    };

    mockTransaction = {
      objectStore: vi.fn(() => mockStore),
      onerror: null,
      error: null,
    };

    mockDB = {
      close: vi.fn(),
      transaction: vi.fn(() => mockTransaction),
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
      createObjectStore: vi.fn(),
    };

    mockOpenRequest = {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB,
      error: null,
    };

    global.indexedDB = {
      open: vi.fn(() => mockOpenRequest),
    } as any;
  });

  describe("openDatabase", () => {
    it("opens database with correct name and version", () => {
      openDatabase();

      expect(global.indexedDB.open).toHaveBeenCalledWith("spreadsheet-db", 1);
    });

    it("resolves with database on success", async () => {
      const promise = openDatabase();

      // Simulate success
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      const db = await promise;
      expect(db).toBe(mockDB);
    });

    it("rejects on error", async () => {
      const promise = openDatabase();
      const testError = new Error("Failed to open");
      mockOpenRequest.error = testError;

      // Simulate error
      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror();
      }

      await expect(promise).rejects.toThrow("Failed to open");
    });

    it("creates object store on upgrade", () => {
      openDatabase();

      // Simulate upgrade
      const event = { target: mockOpenRequest };
      if (mockOpenRequest.onupgradeneeded) {
        mockOpenRequest.onupgradeneeded(event);
      }

      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith("state");
      expect(mockDB.createObjectStore).toHaveBeenCalledWith("state");
    });

    it("does not create object store if it exists", () => {
      mockDB.objectStoreNames.contains = vi.fn(() => true);
      openDatabase();

      // Simulate upgrade
      const event = { target: mockOpenRequest };
      if (mockOpenRequest.onupgradeneeded) {
        mockOpenRequest.onupgradeneeded(event);
      }

      expect(mockDB.createObjectStore).not.toHaveBeenCalled();
    });
  });

  describe("saveToIndexedDB", () => {
    const testState: SpreadsheetState = {
      A1: { rawInput: "10", computedValue: 10, timestamp: 1000 },
      B2: { rawInput: "20", computedValue: 20, timestamp: 2000 },
    };

    it("saves data to IndexedDB", async () => {
      const promise = saveToIndexedDB(testState);

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      // Wait for transaction to be created
      await Promise.resolve();

      expect(mockDB.transaction).toHaveBeenCalledWith(["state"], "readwrite");
      expect(mockStore.put).toHaveBeenCalledWith(testState, "spreadsheet-state");

      // Simulate save success
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }

      await promise;
      expect(mockDB.close).toHaveBeenCalled();
    });

    it("closes database on save error", async () => {
      const promise = saveToIndexedDB(testState);

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      // Simulate save error
      mockRequest.error = new Error("Save failed");
      if (mockRequest.onerror) {
        mockRequest.onerror();
      }

      await expect(promise).rejects.toThrow("Save failed");
      expect(mockDB.close).toHaveBeenCalled();
    });

    it("closes database on transaction error", async () => {
      const promise = saveToIndexedDB(testState);

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      // Simulate transaction error
      mockTransaction.error = new Error("Transaction failed");
      if (mockTransaction.onerror) {
        mockTransaction.onerror();
      }

      await expect(promise).rejects.toThrow("Transaction failed");
      expect(mockDB.close).toHaveBeenCalled();
    });
  });

  describe("loadFromIndexedDB", () => {
    const storedState: SpreadsheetState = {
      A1: { rawInput: "5", computedValue: 5, timestamp: 500 },
    };

    it("loads data from IndexedDB", async () => {
      mockRequest.result = storedState;
      const promise = loadFromIndexedDB();

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      expect(mockDB.transaction).toHaveBeenCalledWith(["state"], "readonly");
      expect(mockStore.get).toHaveBeenCalledWith("spreadsheet-state");

      // Simulate load success
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }

      const result = await promise;
      expect(result).toEqual(storedState);
      expect(mockDB.close).toHaveBeenCalled();
    });

    it("returns undefined when no data exists", async () => {
      mockRequest.result = undefined;
      const promise = loadFromIndexedDB();

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      // Simulate load success with no data
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }

      const result = await promise;
      expect(result).toBeUndefined();
      expect(mockDB.close).toHaveBeenCalled();
    });

    it("closes database on load error", async () => {
      const promise = loadFromIndexedDB();

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      // Simulate load error
      mockRequest.error = new Error("Load failed");
      if (mockRequest.onerror) {
        mockRequest.onerror();
      }

      await expect(promise).rejects.toThrow("Load failed");
      expect(mockDB.close).toHaveBeenCalled();
    });

    it("closes database on transaction error", async () => {
      const promise = loadFromIndexedDB();

      // Simulate database open
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess();
      }

      await Promise.resolve();

      // Simulate transaction error
      mockTransaction.error = new Error("Transaction failed");
      if (mockTransaction.onerror) {
        mockTransaction.onerror();
      }

      await expect(promise).rejects.toThrow("Transaction failed");
      expect(mockDB.close).toHaveBeenCalled();
    });
  });
});
