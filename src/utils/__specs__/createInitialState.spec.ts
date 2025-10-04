import { describe, expect, it } from "vitest";
import { createInitialState } from "../createInitialState";

describe("createInitialState", () => {
  it("creates a spreadsheet with 10 rows and 10 columns", () => {
    const state = createInitialState();
    const cellIds = Object.keys(state);

    expect(cellIds).toHaveLength(100);
  });

  it("initializes all cells with empty rawInput and computedValue", () => {
    const state = createInitialState();

    Object.values(state).forEach((cell) => {
      expect(cell.rawInput).toBe("");
      expect(cell.computedValue).toBe("");
      expect(cell.timestamp).toBeUndefined();
    });
  });

  it("creates cells from A1 to J10", () => {
    const state = createInitialState();

    expect(state.A1).toBeDefined();
    expect(state.J10).toBeDefined();
    expect(state.A10).toBeDefined();
    expect(state.J1).toBeDefined();
  });

  it("includes all column letters A through J", () => {
    const state = createInitialState();
    const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    columns.forEach((col) => {
      expect(state[`${col}1`]).toBeDefined();
      expect(state[`${col}5`]).toBeDefined();
      expect(state[`${col}10`]).toBeDefined();
    });
  });

  it("includes all row numbers 1 through 10", () => {
    const state = createInitialState();

    for (let row = 1; row <= 10; row++) {
      expect(state[`A${row}`]).toBeDefined();
      expect(state[`E${row}`]).toBeDefined();
      expect(state[`J${row}`]).toBeDefined();
    }
  });
});
