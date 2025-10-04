import { useEffect, useRef } from "react";
import type { SpreadsheetState } from "../types/spreadsheet";
import type { WorkerResponse } from "../workers/formulaWorker";
import { logger } from "../utils/logger";

interface UseFormulaWorkerOptions {
  onResult: (cellId: string, rawInput: string, computedValue: string | number) => void;
  onError?: (error: ErrorEvent | Error) => void;
}

export function useFormulaWorker({ onResult, onError }: UseFormulaWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const url = new URL("../workers/formulaWorker.ts", import.meta.url);
    const worker = new Worker(url, { type: "module" });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      // Validate response structure
      if (!response ||
          typeof response !== 'object' ||
          typeof response.cellId !== 'string' ||
          typeof response.rawInput !== 'string' ||
          (response.computedValue !== 0 && !response.computedValue)) {
        logger.error('[Worker] Invalid response format:', response);
        onError?.(new Error('Invalid worker response'));
        return;
      }

      const { cellId, rawInput, computedValue } = response;
      onResult(cellId, rawInput, computedValue);
    };

    worker.onerror = (error) => {
      logger.error("[Worker] Error:", error);
      onError?.(error);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, [onResult, onError]);

  const evaluate = (
    cellId: string,
    rawInput: string,
    spreadsheet: SpreadsheetState
  ) => {
    try {
      workerRef.current?.postMessage({
        cellId,
        rawInput,
        spreadsheet,
      });
    } catch (error) {
      logger.error("[Worker] Failed to post message:", error);
      onError?.(error as Error);
    }
  };

  return { evaluate };
}
