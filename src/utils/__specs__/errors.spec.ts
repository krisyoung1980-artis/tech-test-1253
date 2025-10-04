import { describe, expect, it } from "vitest";
import { DivisionByZeroError, FormulaTooComplexError } from "../errors";

describe("Custom Error Classes", () => {
  describe("DivisionByZeroError", () => {
    it("creates error with correct message", () => {
      const error = new DivisionByZeroError();
      expect(error.message).toBe("Division by zero");
    });

    it("has correct error name", () => {
      const error = new DivisionByZeroError();
      expect(error.name).toBe("DivisionByZeroError");
    });

    it("is instance of Error", () => {
      const error = new DivisionByZeroError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("FormulaTooComplexError", () => {
    it("creates error with correct message", () => {
      const error = new FormulaTooComplexError();
      expect(error.message).toBe("Formula too complex");
    });

    it("has correct error name", () => {
      const error = new FormulaTooComplexError();
      expect(error.name).toBe("FormulaTooComplexError");
    });

    it("is instance of Error", () => {
      const error = new FormulaTooComplexError();
      expect(error).toBeInstanceOf(Error);
    });
  });
});
