import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo } from "react";
import { useSpreadsheetController } from "../hooks/useSpreadsheetController";
import { createColumnDefs, createRowData } from "../utils/gridHelpers";

ModuleRegistry.registerModules([AllCommunityModule]);

export const SpreadsheetGrid: React.FC = () => {
  const { state, update } = useSpreadsheetController();

  const columnDefs = useMemo(() => createColumnDefs(state), [state]);
  const rowData = useMemo(() => createRowData(state), [state]);

  const onCellValueChanged = useCallback(
    (params: any) => {
      const col = params.colDef.field;
      const row = params.node.rowIndex! + 1;
      const cellId = `${col}${row}`;
      const newValue = params.newValue ?? "";

      if (params.node.rowIndex === undefined || params.node.rowIndex === null) {
        return;
      }

      update(cellId, newValue, state);
    },
    [update, state]
  );

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
