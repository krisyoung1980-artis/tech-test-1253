export type CellData = {
  rawInput: string; // what the user typed
  computedValue: string | number; // for now same as rawInput
};

export type SpreadsheetState = Record<string, CellData>;
// e.g., { "A1": {...}, "B2": {...} }
