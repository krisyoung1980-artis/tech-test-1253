import type {
  CellClassParams,
  ColDef,
  ITextCellEditorParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { COLUMNS, ROWS } from "../constants/grid";
import type { SpreadsheetState } from "../types/spreadsheet";

export const createColumnDefs = (state: SpreadsheetState): ColDef[] => [
  {
    headerName: "#",
    field: "rowNum",
    pinned: "left",
    editable: false,
    width: 50,
    suppressMovable: true,
    cellStyle: {
      fontWeight: "bold",
      backgroundColor: `var(--ag-header-background-color)`,
    },
  },
  ...COLUMNS.map((col) => ({
    headerName: col,
    field: col,
    editable: true,
    cellEditor: "agTextCellEditor",
    cellDataType: false,
    cellEditorParams: (params: ITextCellEditorParams) => {
      const row = params.node.rowIndex! + 1;
      const cellId = `${col}${row}`;
      const rawInput = state[cellId]?.rawInput ?? "";

      return {
        value: rawInput,
        useFormatter: false,
      };
    },
    valueFormatter: (params: ValueFormatterParams) => {
      return params.value === undefined || params.value === null
        ? ""
        : String(params.value);
    },
    cellClass: (params: CellClassParams) => {
      const value = parseInt(String(params.value ?? ""), 10);
      return !isNaN(value) && value < 0 ? "negative-cell" : "";
    },
  })),
];

export const createRowData = (state: SpreadsheetState) => {
  return ROWS.map((row, index) => {
    const rowObj: Record<string, string | number> = {
      rowNum: row,
      id: `row-${index}`,
    };
    COLUMNS.forEach((col) => {
      const cellId = `${col}${row}`;
      const cell = state[cellId];
      const value = cell?.computedValue ?? "";
      rowObj[col] = value === "" ? "" : value;
    });
    return rowObj;
  });
};
