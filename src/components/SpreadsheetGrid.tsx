import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeAlpine,
  type CellValueChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo } from "react";
import { useSpreadsheetController } from "../hooks/useSpreadsheetController";
import { createColumnDefs, createRowData } from "../utils/gridHelpers";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeAlpine.withPart(colorSchemeDark);

export const SpreadsheetGrid: React.FC = () => {
  const { state, update } = useSpreadsheetController();

  const columnDefs = useMemo(() => createColumnDefs(state), [state]);
  const rowData = useMemo(() => createRowData(state), [state]);

  const onCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      if (params.node.rowIndex === undefined || params.node.rowIndex === null) {
        return;
      }

      const col = params.colDef.field;
      const row = params.node.rowIndex + 1;
      const cellId = `${col}${row}`;
      const newValue = params.newValue ?? "";

      update(cellId, newValue);
    },
    [update]
  );

  return (
    <AgGridReact
      theme={theme}
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
