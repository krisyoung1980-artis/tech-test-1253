import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSpreadsheetController } from "../useSpreadsheetController";

// Mock dependencies
vi.mock("../useSpreadsheetState", () => ({
  useSpreadsheetState: vi.fn(() => ({
    state: { A1: { rawInput: "10", computedValue: 10, timestamp: 1000 } },
    update: vi.fn((options) => Promise.resolve({ A1: options })),
  })),
}));

vi.mock("../useBroadcastSync", () => ({
  useBroadcastSync: vi.fn(() => ({
    broadcast: vi.fn(),
  })),
}));

vi.mock("../useFormulaWorker", () => ({
  useFormulaWorker: vi.fn(({ onResult }) => ({
    evaluate: vi.fn((cellId, rawInput, spreadsheet) => {
      // Simulate async worker response
      setTimeout(() => onResult(cellId, rawInput, 42), 0);
    }),
  })),
}));

describe("useSpreadsheetController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns state and update function", () => {
    const { result } = renderHook(() => useSpreadsheetController());

    expect(result.current).toHaveProperty("state");
    expect(result.current).toHaveProperty("update");
    expect(typeof result.current.update).toBe("function");
  });

  it("provides state from useSpreadsheetState", () => {
    const { result } = renderHook(() => useSpreadsheetController());

    expect(result.current.state).toEqual({
      A1: { rawInput: "10", computedValue: 10, timestamp: 1000 },
    });
  });

  it("handles cell update through formula worker", async () => {
    const { result } = renderHook(() => useSpreadsheetController());
    const { useFormulaWorker } = await import("../useFormulaWorker");
    const mockEvaluate = vi.fn();

    vi.mocked(useFormulaWorker).mockReturnValue({
      evaluate: mockEvaluate,
    });

    const { result: newResult } = renderHook(() => useSpreadsheetController());

    newResult.current.update("B2", "=A1+10");

    expect(mockEvaluate).toHaveBeenCalledWith(
      "B2",
      "=A1+10",
      expect.any(Object)
    );
  });

  it("handles remote messages via broadcast sync", async () => {
    const { useBroadcastSync } = await import("../useBroadcastSync");
    const { useSpreadsheetState } = await import("../useSpreadsheetState");
    const mockUpdate = vi.fn();

    vi.mocked(useSpreadsheetState).mockReturnValue({
      state: {},
      update: mockUpdate,
    });

    let capturedOnMessage: any;
    vi.mocked(useBroadcastSync).mockImplementation(({ onMessage }) => {
      capturedOnMessage = onMessage;
      return { broadcast: vi.fn() };
    });

    renderHook(() => useSpreadsheetController());

    // Simulate receiving a broadcast message
    capturedOnMessage({
      cellId: "C3",
      rawInput: "20",
      computedValue: 20,
      timestamp: 2000,
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      cellId: "C3",
      rawInput: "20",
      computedValue: 20,
      timestamp: 2000,
      source: "remote",
    });
  });
});
