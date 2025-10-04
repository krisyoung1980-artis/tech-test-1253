import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSpreadsheetState } from "../useSpreadsheetState";

vi.mock("../../utils/timestamp", () => ({
  getTimestamp: vi.fn(() => 1234567890),
}));

describe("useSpreadsheetState", () => {
  it("initializes with empty cells for 10 rows and 5 columns", () => {
    const { result } = renderHook(() => useSpreadsheetState());

    expect(result.current.state.A1).toEqual({
      rawInput: "",
      computedValue: "",
    });
    expect(result.current.state.E10).toEqual({
      rawInput: "",
      computedValue: "",
    });
  });

  it("updates cell with local source", () => {
    const { result } = renderHook(() => useSpreadsheetState());

    act(() => {
      result.current.update({
        cellId: "A1",
        rawInput: "hello",
        computedValue: "hello",
        source: "local",
      });
    });

    expect(result.current.state.A1.rawInput).toBe("hello");
    expect(result.current.state.A1.computedValue).toBe("hello");
    expect(result.current.state.A1.timestamp).toBeGreaterThan(0);
  });

  it("updates cell from worker preserving rawInput", () => {
    const { result } = renderHook(() => useSpreadsheetState());

    act(() => {
      result.current.update({
        cellId: "B2",
        rawInput: "=1+1",
        computedValue: 2,
        source: "local",
      });
    });

    expect(result.current.state.B2.rawInput).toBe("=1+1");
    expect(result.current.state.B2.computedValue).toBe(2);
  });

  it("updates cell from broadcast with timestamp", () => {
    const { result } = renderHook(() => useSpreadsheetState());
    const timestamp = 9999999999;

    act(() => {
      result.current.update({
        cellId: "C3",
        rawInput: "test",
        computedValue: "test",
        timestamp,
        source: "remote",
      });
    });

    expect(result.current.state.C3.rawInput).toBe("test");
    expect(result.current.state.C3.computedValue).toBe("test");
    expect(result.current.state.C3.timestamp).toBe(timestamp);
  });

  it("ignores stale broadcast updates", () => {
    const { result } = renderHook(() => useSpreadsheetState());
    const timestamp1 = 2000000000;
    const timestamp2 = 1000000000;

    act(() => {
      result.current.update({
        cellId: "D4",
        rawInput: "newer",
        computedValue: "newer",
        timestamp: timestamp1,
        source: "remote",
      });
    });

    act(() => {
      result.current.update({
        cellId: "D4",
        rawInput: "older",
        computedValue: "older",
        timestamp: timestamp2,
        source: "remote",
      });
    });

    expect(result.current.state.D4.computedValue).toBe("newer");
  });

  it("accepts newer broadcast updates", () => {
    const { result } = renderHook(() => useSpreadsheetState());
    const timestamp1 = 1000000000;
    const timestamp2 = 2000000000;

    act(() => {
      result.current.update({
        cellId: "E5",
        rawInput: "older",
        computedValue: "older",
        timestamp: timestamp1,
        source: "remote",
      });
    });

    act(() => {
      result.current.update({
        cellId: "E5",
        rawInput: "newer",
        computedValue: "newer",
        timestamp: timestamp2,
        source: "remote",
      });
    });

    expect(result.current.state.E5.computedValue).toBe("newer");
  });

  it("local source creates cell if it doesn't exist", () => {
    const { result } = renderHook(() => useSpreadsheetState());

    act(() => {
      result.current.update({
        cellId: "Z99",
        rawInput: "test",
        computedValue: "test",
        source: "local",
      });
    });

    expect(result.current.state.Z99).toBeDefined();
    expect(result.current.state.Z99.computedValue).toBe("test");
  });
});
