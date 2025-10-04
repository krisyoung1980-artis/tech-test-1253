import { useEffect, useRef, useCallback } from "react";
import type { SpreadsheetState } from "../types/spreadsheet";

interface StorageMessage {
  type: "save" | "load";
  requestId: string;
  payload?: SpreadsheetState;
}

interface StorageResponse {
  type: "loaded" | "saved" | "error";
  requestId: string;
  payload?: SpreadsheetState;
  error?: string;
}

export function useStorageWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/storageWorker.ts", import.meta.url),
      { type: "module" }
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const loadState = useCallback((): Promise<SpreadsheetState | undefined> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const requestId = crypto.randomUUID();

      const handleMessage = (event: MessageEvent<StorageResponse>) => {
        if (event.data.requestId !== requestId) return;

        workerRef.current?.removeEventListener("message", handleMessage);

        if (event.data.type === "error") {
          reject(new Error(event.data.error));
        } else if (event.data.type === "loaded") {
          resolve(event.data.payload);
        }
      };

      workerRef.current.addEventListener("message", handleMessage);
      workerRef.current.postMessage({ type: "load", requestId } as StorageMessage);
    });
  }, []);

  const saveState = useCallback((state: SpreadsheetState): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const requestId = crypto.randomUUID();

      const handleMessage = (event: MessageEvent<StorageResponse>) => {
        if (event.data.requestId !== requestId) return;

        workerRef.current?.removeEventListener("message", handleMessage);

        if (event.data.type === "error") {
          reject(new Error(event.data.error));
        } else if (event.data.type === "saved") {
          resolve();
        }
      };

      workerRef.current.addEventListener("message", handleMessage);
      workerRef.current.postMessage({ type: "save", requestId, payload: state } as StorageMessage);
    });
  }, []);

  return { loadState, saveState };
}
