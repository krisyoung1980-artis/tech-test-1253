import { useCallback } from "react";
import type { BroadcastMessage } from "../types/spreadsheet";
import { getTimestamp } from "../utils/timestamp";
import { useBroadcastSync } from "./useBroadcastSync";
import { useFormulaWorker } from "./useFormulaWorker";
import { useSpreadsheetState } from "./useSpreadsheetState";

export function useSpreadsheetController() {
  const { state, update: updateState } = useSpreadsheetState();

  const onMessage = useCallback(
    (message: BroadcastMessage) => {
      updateState({
        cellId: message.cellId,
        rawInput: message.rawInput,
        computedValue: message.computedValue,
        timestamp: message.timestamp,
        source: "remote",
      });
    },
    [updateState]
  );

  const { broadcast } = useBroadcastSync({ onMessage });

  const onResult = useCallback(
    (cellId: string, rawInput: string, computedValue: string | number) => {
      updateState({
        cellId,
        rawInput,
        computedValue,
        source: "local",
      }).then(() =>
        broadcast({
          cellId,
          rawInput,
          computedValue,
          timestamp: getTimestamp(),
        })
      );
    },
    [updateState, broadcast]
  );

  const { evaluate } = useFormulaWorker({ onResult });

  return {
    state,
    update: evaluate,
  };
}
