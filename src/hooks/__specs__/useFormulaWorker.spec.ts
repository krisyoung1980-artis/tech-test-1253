import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useFormulaWorker } from "../useFormulaWorker";
import type { SpreadsheetState } from "../../types/spreadsheet";

describe("useFormulaWorker", () => {
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    onmessage: ((event: MessageEvent) => void) | null;
  };

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
    };

    global.Worker = vi.fn().mockImplementation(() => mockWorker);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Worker on mount", () => {
    const onResult = vi.fn();
    renderHook(() => useFormulaWorker({ onResult }));

    expect(global.Worker).toHaveBeenCalled();
  });

  it("sets up onmessage handler", () => {
    const onResult = vi.fn();
    renderHook(() => useFormulaWorker({ onResult }));

    expect(mockWorker.onmessage).toBeDefined();
  });

  it("calls onResult when receiving worker response", async () => {
    const onResult = vi.fn();
    renderHook(() => useFormulaWorker({ onResult }));

    act(() => {
      mockWorker.onmessage?.(
        new MessageEvent("message", {
          data: { cellId: "A1", rawInput: "=1+1", computedValue: 42 },
        })
      );
    });

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith("A1", "=1+1", 42);
    });
  });

  it("sends formula to worker via evaluate", () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useFormulaWorker({ onResult }));

    const spreadsheet: SpreadsheetState = {
      B1: { rawInput: "5", computedValue: 5 },
    };

    act(() => {
      result.current.evaluate("A1", "=B1+10", spreadsheet);
    });

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      cellId: "A1",
      rawInput: "=B1+10",
      spreadsheet,
    });
  });

  it("terminates worker on unmount", () => {
    const onResult = vi.fn();
    const { unmount } = renderHook(() => useFormulaWorker({ onResult }));

    unmount();

    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
