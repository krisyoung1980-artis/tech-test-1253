import { describe, expect, it, vi } from "vitest";
import type { SpreadsheetState } from "../../types/spreadsheet";
import {
  evaluateFormula,
  resolveCellReference,
  substituteCellReferences,
} from "../formulaEvaluator";

vi.mock("../logger");

describe("formulaEvaluator", () => {
  describe("resolveCellReference", () => {
    it("should resolve numeric cell values", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "5", computedValue: 5 },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(5);
    });

    it("should resolve string number values", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "42", computedValue: "42" },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(42);
    });

    it("should return 0 for empty cells", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "", computedValue: "" },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(0);
    });

    it("should return 0 for non-existent cells", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(resolveCellReference("Z99", spreadsheet)).toBe(0);
    });

    it("should return 0 for non-numeric string values", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "text", computedValue: "text" },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(0);
    });

    it("should handle decimal numbers", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "3.14", computedValue: 3.14 },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(3.14);
    });

    it("should handle negative numbers", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "-10", computedValue: -10 },
      };

      expect(resolveCellReference("A1", spreadsheet)).toBe(-10);
    });
  });

  describe("substituteCellReferences", () => {
    it("should substitute single cell reference", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "5", computedValue: 5 },
      };

      const result = substituteCellReferences("A1+10", spreadsheet);
      expect(result).toBe("5+10");
    });

    it("should substitute multiple cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "5", computedValue: 5 },
        B2: { rawInput: "10", computedValue: 10 },
      };

      const result = substituteCellReferences("A1+B2", spreadsheet);
      expect(result).toBe("5+10");
    });

    it("should handle expressions without cell references", () => {
      const spreadsheet: SpreadsheetState = {};

      const result = substituteCellReferences("1+2", spreadsheet);
      expect(result).toBe("1+2");
    });

    it("should substitute cell references in complex expressions", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "2", computedValue: 2 },
        B1: { rawInput: "3", computedValue: 3 },
        C1: { rawInput: "4", computedValue: 4 },
      };

      const result = substituteCellReferences("A1+B1*C1", spreadsheet);
      expect(result).toBe("2+3*4");
    });

    it("should handle multi-digit row numbers", () => {
      const spreadsheet: SpreadsheetState = {
        A10: { rawInput: "100", computedValue: 100 },
      };

      const result = substituteCellReferences("A10+5", spreadsheet);
      expect(result).toBe("100+5");
    });

    it("should handle lowercase cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "5", computedValue: 5 },
        B1: { rawInput: "10", computedValue: 10 },
      };

      const result = substituteCellReferences("a1+b1", spreadsheet);
      expect(result).toBe("5+10");
    });

    it("should handle mixed case cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "7", computedValue: 7 },
        B2: { rawInput: "3", computedValue: 3 },
      };

      const result = substituteCellReferences("A1+b2", spreadsheet);
      expect(result).toBe("7+3");
    });
  });

  describe("evaluateFormula", () => {
    it("should evaluate simple arithmetic formula", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=1+2", spreadsheet)).toBe(3);
    });

    it("should evaluate formula with multiplication", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=5*3", spreadsheet)).toBe(15);
    });

    it("should evaluate formula with subtraction", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=10-7", spreadsheet)).toBe(3);
    });

    it("should evaluate formula with cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "5", computedValue: 5 },
        B1: { rawInput: "10", computedValue: 10 },
      };

      expect(evaluateFormula("=A1+B1", spreadsheet)).toBe(15);
    });

    it("should respect operator precedence", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=2+3*4", spreadsheet)).toBe(14);
    });

    it("should handle complex formulas", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "10", computedValue: 10 },
        B1: { rawInput: "5", computedValue: 5 },
      };

      expect(evaluateFormula("=A1*2-B1", spreadsheet)).toBe(15);
    });

    it("should return #ERROR for invalid formulas", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=invalid!", spreadsheet)).toBe("#ERROR");
    });

    it("should return #ERROR for division by zero", () => {
      const spreadsheet: SpreadsheetState = {};
      expect(evaluateFormula("=1/0", spreadsheet)).toBe("#ERROR");
    });

    it("should return input unchanged for non-formula values", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("plain text", spreadsheet)).toBe("plain text");
    });

    it("should handle formulas with empty cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "", computedValue: "" },
        B1: { rawInput: "5", computedValue: 5 },
      };

      expect(evaluateFormula("=A1+B1", spreadsheet)).toBe(5);
    });

    it("should handle negative results", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=5-10", spreadsheet)).toBe(-5);
    });

    it("should handle decimal results", () => {
      const spreadsheet: SpreadsheetState = {};

      expect(evaluateFormula("=10*0.5", spreadsheet)).toBe(5);
    });

    it("should evaluate formulas with lowercase cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "8", computedValue: 8 },
        B1: { rawInput: "4", computedValue: 4 },
      };

      expect(evaluateFormula("=a1+b1", spreadsheet)).toBe(12);
    });

    it("should evaluate formulas with mixed case cell references", () => {
      const spreadsheet: SpreadsheetState = {
        A1: { rawInput: "20", computedValue: 20 },
        B2: { rawInput: "5", computedValue: 5 },
      };

      expect(evaluateFormula("=A1-b2", spreadsheet)).toBe(15);
    });
  });
});
