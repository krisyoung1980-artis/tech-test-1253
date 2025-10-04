import { useCallback, useEffect, useState } from "react";
import type { SpreadsheetState } from "../types/spreadsheet";
import { createInitialState } from "../utils/createInitialState.ts";
import { getTimestamp } from "../utils/timestamp";
import { useStorageWorker } from "./useStorageWorker";
import { logger } from "../utils/logger";

type UpdateSource = "local" | "remote";

export interface UpdateOptions {
  cellId: string;
  rawInput?: string;
  computedValue: string | number;
  timestamp?: number;
  source: UpdateSource;
}

const applyRemoteUpdate = (
  prev: SpreadsheetState,
  cellId: string,
  rawInput: string,
  computedValue: string | number,
  timestamp: number
): SpreadsheetState => {
  const existing = prev[cellId];
  const isStaleUpdate =
    existing?.timestamp && timestamp && existing.timestamp >= timestamp;
  if (isStaleUpdate) return prev;
  return {
    ...prev,
    [cellId]: {
      rawInput,
      computedValue,
      timestamp: timestamp ?? getTimestamp(),
    },
  };
};

const applyLocalUpdate = (
  prev: SpreadsheetState,
  cellId: string,
  rawInput: string,
  computedValue: string | number
): SpreadsheetState => {
  return {
    ...prev,
    [cellId]: {
      rawInput,
      computedValue,
      timestamp: getTimestamp(),
    },
  };
};

export function useSpreadsheetState() {
  const [spreadsheetState, setSpreadsheetState] =
    useState<SpreadsheetState>(createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const { loadState, saveState } = useStorageWorker();

  useEffect(() => {
    loadState()
      .then((storedState) => {
        if (storedState) {
          const initialState = createInitialState();
          setSpreadsheetState({ ...initialState, ...storedState });
        }
        setIsHydrated(true);
      })
      .catch((error) => {
        logger.error("Failed to load state from storage:", error);
        setIsHydrated(true);
      });
  }, [loadState]);

  useEffect(() => {
    if (!isHydrated) return;

    saveState(spreadsheetState).catch((error) => {
      logger.error("Failed to save state to storage:", error);
    });
  }, [spreadsheetState, isHydrated, saveState]);

  const calculateNextState = useCallback(
    (prev: SpreadsheetState, options: UpdateOptions) => {
      const { cellId, rawInput, computedValue, timestamp, source } = options;
      switch (source) {
        case "remote":
          return applyRemoteUpdate(
            prev,
            cellId,
            rawInput ?? "",
            computedValue,
            timestamp ?? getTimestamp()
          );
        case "local":
          return applyLocalUpdate(prev, cellId, rawInput ?? "", computedValue);
        default:
          return prev;
      }
    },
    []
  );

  const update = useCallback(
    (options: UpdateOptions): Promise<SpreadsheetState> => {
      return new Promise((resolve) => {
        setSpreadsheetState((prev) => {
          const nextState = calculateNextState(prev, options);
          resolve(nextState);
          return nextState;
        });
      });
    },
    [calculateNextState]
  );

  return {
    state: spreadsheetState,
    update,
  };
}
