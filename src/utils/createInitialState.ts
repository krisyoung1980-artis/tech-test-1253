import type { SpreadsheetState } from "../types/spreadsheet";
import { COLUMNS, ROWS } from "../constants/grid";

export const createInitialState = (): SpreadsheetState => {
  const state: SpreadsheetState = {};
  for (const col of COLUMNS) {
    for (const row of ROWS) {
      const cellId = `${col}${row}`;
      state[cellId] = { rawInput: "", computedValue: "" };
    }
  }
  return state;
};
