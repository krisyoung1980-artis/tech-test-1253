export type CellData = {
  rawInput: string;
  computedValue: string | number;
  timestamp?: number;
};

export type SpreadsheetState = Record<string, CellData>;

export interface BroadcastMessage {
  cellId: string;
  rawInput: string;
  computedValue: string | number;
  timestamp: number;
}
