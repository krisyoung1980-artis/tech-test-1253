import { describe, expect, it } from "vitest";
import { createColumnDefs, createRowData } from "../gridHelpers";
import type { SpreadsheetState } from "../../types/spreadsheet";

describe("gridHelpers", () => {
  describe("createColumnDefs", () => {
    it("creates column definitions with row number column and A-J columns", () => {
      const state: SpreadsheetState = {
        A1: { rawInput: "test", computedValue: "test" },
      };

      const columnDefs = createColumnDefs(state);

      expect(columnDefs).toHaveLength(11);
      expect(columnDefs[0].headerName).toBe("#");
      expect(columnDefs[0].field).toBe("rowNum");
      expect(columnDefs[1].headerName).toBe("A");
      expect(columnDefs[2].headerName).toBe("B");
      expect(columnDefs[3].headerName).toBe("C");
      expect(columnDefs[4].headerName).toBe("D");
      expect(columnDefs[5].headerName).toBe("E");
      expect(columnDefs[6].headerName).toBe("F");
      expect(columnDefs[7].headerName).toBe("G");
      expect(columnDefs[8].headerName).toBe("H");
      expect(columnDefs[9].headerName).toBe("I");
      expect(columnDefs[10].headerName).toBe("J");
    });

    it("row number column is pinned and not editable", () => {
      const state: SpreadsheetState = {};
      const columnDefs = createColumnDefs(state);
      const rowNumCol = columnDefs[0];

      expect(rowNumCol.pinned).toBe("left");
      expect(rowNumCol.editable).toBe(false);
    });

    it("data columns are editable", () => {
      const state: SpreadsheetState = {};
      const columnDefs = createColumnDefs(state);
      const dataColumns = columnDefs.slice(1);

      dataColumns.forEach((col) => {
        expect(col.editable).toBe(true);
      });
    });
  });

  describe("createRowData", () => {
    it("creates 10 rows of data", () => {
      const state: SpreadsheetState = {};
      for (let row = 1; row <= 10; row++) {
        for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
          state[`${col}${row}`] = { rawInput: "", computedValue: "" };
        }
      }

      const rowData = createRowData(state);

      expect(rowData).toHaveLength(10);
    });

    it("includes row numbers from 1 to 10", () => {
      const state: SpreadsheetState = {};
      for (let row = 1; row <= 10; row++) {
        for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
          state[`${col}${row}`] = { rawInput: "", computedValue: "" };
        }
      }

      const rowData = createRowData(state);

      rowData.forEach((row, index) => {
        expect(row.rowNum).toBe(index + 1);
        expect(row.id).toBe(`row-${index}`);
      });
    });

    it("maps cell computed values to row data", () => {
      const state: SpreadsheetState = {
        A1: { rawInput: "hello", computedValue: "hello" },
        B1: { rawInput: "=1+1", computedValue: 2 },
        C1: { rawInput: "", computedValue: "" },
      };
      for (let row = 1; row <= 10; row++) {
        for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
          if (!state[`${col}${row}`]) {
            state[`${col}${row}`] = { rawInput: "", computedValue: "" };
          }
        }
      }

      const rowData = createRowData(state);
      const firstRow = rowData[0];

      expect(firstRow.A).toBe("hello");
      expect(firstRow.B).toBe(2);
      expect(firstRow.C).toBe("");
    });

    it("converts empty string values correctly", () => {
      const state: SpreadsheetState = {};
      for (let row = 1; row <= 10; row++) {
        for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
          state[`${col}${row}`] = { rawInput: "", computedValue: "" };
        }
      }

      const rowData = createRowData(state);

      rowData.forEach((row) => {
        expect(row.A).toBe("");
        expect(row.B).toBe("");
        expect(row.C).toBe("");
        expect(row.D).toBe("");
        expect(row.E).toBe("");
        expect(row.F).toBe("");
        expect(row.G).toBe("");
        expect(row.H).toBe("");
        expect(row.I).toBe("");
        expect(row.J).toBe("");
      });
    });
  });
});
