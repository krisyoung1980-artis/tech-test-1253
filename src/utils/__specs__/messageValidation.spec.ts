import { describe, expect, it } from "vitest";
import type {
  BroadcastMessage,
  SpreadsheetState,
} from "../../types/spreadsheet";
import {
  isValidBroadcastMessage,
  isValidStorageMessage,
  isValidWorkerMessage,
  type StorageMessage,
  type WorkerMessage,
} from "../messageValidation";

describe("messageValidation", () => {
  describe("isValidWorkerMessage", () => {
    it("returns true for valid worker message", () => {
      const validMessage: WorkerMessage = {
        cellId: "A1",
        rawInput: "=1+2",
        spreadsheet: {} as SpreadsheetState,
      };

      expect(isValidWorkerMessage(validMessage)).toBe(true);
    });

    it("returns false for null or undefined", () => {
      expect(isValidWorkerMessage(null)).toBe(false);
      expect(isValidWorkerMessage(undefined)).toBe(false);
    });

    it("returns false for non-object types", () => {
      expect(isValidWorkerMessage("string")).toBe(false);
      expect(isValidWorkerMessage(123)).toBe(false);
      expect(isValidWorkerMessage(true)).toBe(false);
    });

    it("returns false when cellId is missing", () => {
      const message = {
        rawInput: "=1+2",
        spreadsheet: {} as SpreadsheetState,
      };

      expect(isValidWorkerMessage(message)).toBe(false);
    });

    it("returns false when rawInput is not a string", () => {
      const message = {
        cellId: "A1",
        rawInput: 123,
        spreadsheet: {} as SpreadsheetState,
      };

      expect(isValidWorkerMessage(message)).toBe(false);
    });

    it("returns false when spreadsheet is missing", () => {
      const message = {
        cellId: "A1",
        rawInput: "=1+2",
      };

      expect(isValidWorkerMessage(message)).toBe(false);
    });
  });

  describe("isValidBroadcastMessage", () => {
    it("returns true for valid broadcast message with number value", () => {
      const validMessage: BroadcastMessage = {
        cellId: "A1",
        rawInput: "=1+2",
        computedValue: 3,
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(validMessage)).toBe(true);
    });

    it("returns true for valid broadcast message with string value", () => {
      const validMessage: BroadcastMessage = {
        cellId: "A1",
        rawInput: "hello",
        computedValue: "hello",
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(validMessage)).toBe(true);
    });

    it("returns true for valid broadcast message with zero value", () => {
      const validMessage: BroadcastMessage = {
        cellId: "A1",
        rawInput: "=0",
        computedValue: 0,
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(validMessage)).toBe(true);
    });

    it("returns false for null or undefined", () => {
      expect(isValidBroadcastMessage(null)).toBe(false);
      expect(isValidBroadcastMessage(undefined)).toBe(false);
    });

    it("returns false for non-object types", () => {
      expect(isValidBroadcastMessage("string")).toBe(false);
      expect(isValidBroadcastMessage(123)).toBe(false);
    });

    it("returns false when cellId is missing", () => {
      const message = {
        rawInput: "=1+2",
        computedValue: 3,
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(message)).toBe(false);
    });

    it("returns false when rawInput is not a string", () => {
      const message = {
        cellId: "A1",
        rawInput: 123,
        computedValue: 3,
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(message)).toBe(false);
    });

    it("returns false when computedValue is missing", () => {
      const message = {
        cellId: "A1",
        rawInput: "=1+2",
        timestamp: Date.now(),
      };

      expect(isValidBroadcastMessage(message)).toBe(false);
    });

    it("returns false when timestamp is not a number", () => {
      const message = {
        cellId: "A1",
        rawInput: "=1+2",
        computedValue: 3,
        timestamp: "not-a-number",
      };

      expect(isValidBroadcastMessage(message)).toBe(false);
    });
  });

  describe("isValidStorageMessage", () => {
    it("returns true for valid save message", () => {
      const validMessage: StorageMessage = {
        type: "save",
        requestId: "test-id-123",
        payload: {} as SpreadsheetState,
      };

      expect(isValidStorageMessage(validMessage)).toBe(true);
    });

    it("returns true for valid load message", () => {
      const validMessage: StorageMessage = {
        type: "load",
        requestId: "test-id-456",
      };

      expect(isValidStorageMessage(validMessage)).toBe(true);
    });

    it("returns false for null or undefined", () => {
      expect(isValidStorageMessage(null)).toBe(false);
      expect(isValidStorageMessage(undefined)).toBe(false);
    });

    it("returns false for non-object types", () => {
      expect(isValidStorageMessage("string")).toBe(false);
      expect(isValidStorageMessage(123)).toBe(false);
    });

    it("returns false when type is missing", () => {
      const message = {
        payload: {} as SpreadsheetState,
      };

      expect(isValidStorageMessage(message)).toBe(false);
    });

    it("returns false when type is invalid", () => {
      const message = {
        type: "invalid",
        payload: {} as SpreadsheetState,
      };

      expect(isValidStorageMessage(message)).toBe(false);
    });

    it("returns false when save message is missing payload", () => {
      const message = {
        type: "save",
      };

      expect(isValidStorageMessage(message)).toBe(false);
    });
  });
});
