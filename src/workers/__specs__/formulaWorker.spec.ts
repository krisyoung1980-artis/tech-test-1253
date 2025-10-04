import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { WorkerMessage, WorkerResponse } from "../formulaWorker";

describe("FormulaWorker", () => {
  let worker: Worker;

  beforeEach(() => {
    worker = new Worker(new URL("../formulaWorker.ts", import.meta.url), {
      type: "module",
    });
  });

  afterEach(() => {
    worker.terminate();
  });

  it("should evaluate a simple arithmetic formula", async () => {
    const message: WorkerMessage = {
      cellId: "A1",
      rawInput: "=1+2",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("A1");
    expect(result.computedValue).toBe(3);
  });

  it("should evaluate formulas with multiplication", async () => {
    const message: WorkerMessage = {
      cellId: "B1",
      rawInput: "=5*3",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("B1");
    expect(result.computedValue).toBe(15);
  });

  it("should evaluate formulas with subtraction", async () => {
    const message: WorkerMessage = {
      cellId: "C1",
      rawInput: "=10-3",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("C1");
    expect(result.computedValue).toBe(7);
  });

  it("should resolve cell references in formulas", async () => {
    const message: WorkerMessage = {
      cellId: "D1",
      rawInput: "=A1+B1",
      spreadsheet: {
        A1: { rawInput: "5", computedValue: 5 },
        B1: { rawInput: "10", computedValue: 10 },
      },
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("D1");
    expect(result.computedValue).toBe(15);
  });

  it("should handle cell references with string numbers", async () => {
    const message: WorkerMessage = {
      cellId: "E1",
      rawInput: "=A1+B1",
      spreadsheet: {
        A1: { rawInput: "7", computedValue: "7" },
        B1: { rawInput: "3", computedValue: "3" },
      },
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("E1");
    expect(result.computedValue).toBe(10);
  });

  it("should treat empty cell references as 0", async () => {
    const message: WorkerMessage = {
      cellId: "F1",
      rawInput: "=A1+B1",
      spreadsheet: {
        A1: { rawInput: "", computedValue: "" },
        B1: { rawInput: "5", computedValue: 5 },
      },
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("F1");
    expect(result.computedValue).toBe(5);
  });

  it("should handle complex formulas with multiple operators", async () => {
    const message: WorkerMessage = {
      cellId: "G1",
      rawInput: "=2+3*4",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("G1");
    expect(result.computedValue).toBe(14); // Respects operator precedence
  });

  it("should return #ERROR for invalid formulas", async () => {
    const message: WorkerMessage = {
      cellId: "H1",
      rawInput: "=invalid syntax!",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("H1");
    expect(result.computedValue).toBe("#ERROR");
  });

  it("should not evaluate non-formula inputs", async () => {
    const message: WorkerMessage = {
      cellId: "I1",
      rawInput: "plain text",
      spreadsheet: {},
    };

    const result = await new Promise<WorkerResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data);
      };
      worker.postMessage(message);
    });

    expect(result.cellId).toBe("I1");
    expect(result.computedValue).toBe("plain text");
  });
});
