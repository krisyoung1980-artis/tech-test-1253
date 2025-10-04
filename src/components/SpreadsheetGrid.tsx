import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SpreadsheetState } from "../types/spreadsheet";
import type { WorkerResponse } from "../workers/formulaWorker";

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
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/formulaWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { cellId, computedValue } = event.data;
      console.log(`[Main] Received result for ${cellId}:`, computedValue, `(type: ${typeof computedValue})`);

      setSpreadsheet((prev) => {
        // Only update if the cell still exists
        if (!prev[cellId]) {
          console.warn(`[Main] Cell ${cellId} not found in spreadsheet state`);
          return prev;
        }

        console.log(`[Main] Updating ${cellId} from "${prev[cellId].computedValue}" to "${computedValue}"`);

        const newState = {
          ...prev,
          [cellId]: {
            rawInput: prev[cellId].rawInput,
            computedValue,
          },
        };

        return newState;
      });
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

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
        cellDataType: false, // Disable automatic type detection
        cellEditorParams: (params: any) => {
          // When editing starts, provide the rawInput value to the editor
          const row = params.node.rowIndex! + 1;
          const cellId = `${col}${row}`;
          const rawInput = spreadsheet[cellId]?.rawInput ?? "";

          return {
            value: rawInput,
            useFormatter: false,
          };
        },
        valueFormatter: (params: any) => {
          // Display the computed value
          return params.value === undefined || params.value === null ? "" : String(params.value);
        },
      })),
    ],
    [spreadsheet]
  );

  const rowData = useMemo(() => {
    console.log('[Main] Generating rowData from spreadsheet state');
    return ROWS.map((row, index) => {
      const rowObj: Record<string, string | number> = {
        rowNum: row,
        id: `row-${index}` // Use string ID for better tracking
      };
      COLUMNS.forEach((col) => {
        const cellId = `${col}${row}`;
        const value = spreadsheet[cellId].computedValue;
        // Convert empty string to empty string for display, or use the actual value
        // AG Grid handles empty strings fine for display
        rowObj[col] = value === "" ? "" : value;
        console.log(`  ${cellId}: "${value}" (${typeof value})`);
      });
      return rowObj;
    });
  }, [spreadsheet]);

  const onCellValueChanged = useCallback((params: any) => {
    const col = params.colDef.field;
    const row = params.node.rowIndex! + 1;
    const cellId = `${col}${row}`;
    const newValue = params.newValue ?? "";

    console.log(`[Main] Cell changed: ${cellId} = "${newValue}" (row: ${row}, col: ${col})`);

    // Prevent AG Grid from applying changes to multiple cells
    if (params.node.rowIndex === undefined || params.node.rowIndex === null) {
      console.warn('[Main] Invalid row index, skipping update');
      return;
    }

    setSpreadsheet((prev) => {
      // Create a completely new object to ensure immutability
      const updated: SpreadsheetState = {};

      // Copy all existing cells
      for (const key in prev) {
        updated[key] = { ...prev[key] };
      }

      // Update only the specific cell
      updated[cellId] = {
        rawInput: newValue,
        computedValue: newValue,
      };

      // If formula, send to Worker for evaluation
      if (newValue?.startsWith("=")) {
        console.log(`[Main] Sending formula to worker:`, { cellId, rawInput: newValue });
        workerRef.current?.postMessage({
          cellId,
          rawInput: newValue,
          spreadsheet: prev,
        });
      }

      return updated;
    });
  }, []);

  return (
    <AgGridReact
      theme={themeAlpine}
      rowData={rowData}
      columnDefs={columnDefs}
      defaultColDef={{ flex: 1, resizable: true }}
      onCellValueChanged={onCellValueChanged}
      getRowId={(params) => params.data.id}
      suppressFieldDotNotation={true}
      singleClickEdit={false}
      stopEditingWhenCellsLoseFocus={true}
    />
  );
};
