import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo, useState } from "react";
import { SpreadsheetState } from "../types/spreadsheet";

ModuleRegistry.registerModules([AllCommunityModule]);

const COLUMNS = ["A", "B", "C", "D", "E"];
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

const generateInitialState = (): SpreadsheetState => {
  const state: SpreadsheetState = {};
  for (const col of COLUMNS) {
    for (const row of ROWS) {
      const cellId = `${col}${row}`;
      state[cellId] = { rawInput: "", computedValue: "" };
    }
  }
  return state;
};

export const SpreadsheetGrid: React.FC = () => {
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetState>(
    generateInitialState()
  );

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "#",
        field: "rowNum",
        pinned: "left",
        editable: false,
        width: 50,
        suppressMovable: true,
        cellStyle: { fontWeight: "bold", backgroundColor: "#f5f5f5" },
      },
      ...COLUMNS.map((col) => ({
        headerName: col,
        field: col,
        editable: true,
        cellEditor: "agTextCellEditor",
      })),
    ],
    []
  );

  // Row data derived from spreadsheet state
  const rowData = ROWS.map((row) => {
    const rowObj: Record<string, string | number> = { rowNum: row };
    COLUMNS.forEach((col) => {
      const cellId = `${col}${row}`;
      rowObj[col] = spreadsheet[cellId].computedValue;
    });
    return rowObj;
  });

  // Handle cell edit
  const onCellValueChanged = useCallback((params: any) => {
    const col = params.colDef.field;
    const row = params.node.rowIndex! + 1;
    const cellId = `${col}${row}`;

    setSpreadsheet((prev) => ({
      ...prev,
      [cellId]: {
        rawInput: params.newValue,
        computedValue: params.newValue, // placeholder until formula evaluation
      },
    }));
  }, []);

  return (
    <AgGridReact
      theme={themeAlpine}
      rowData={rowData}
      columnDefs={columnDefs}
      defaultColDef={{ flex: 1, resizable: true }}
      onCellValueChanged={onCellValueChanged}
    />
  );
};
