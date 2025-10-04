import { useCallback, useEffect, useRef } from "react";
import type { BroadcastMessage } from "../types/spreadsheet";
import { isValidBroadcastMessage } from "../utils/messageValidation";
import { logger } from "../utils/logger";

interface UseBroadcastSyncOptions {
  onMessage: (message: BroadcastMessage) => void;
  onError?: (error: MessageEvent | Error) => void;
}

export function useBroadcastSync({ onMessage, onError }: UseBroadcastSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("spreadsheet-sync");

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data;

      if (!isValidBroadcastMessage(message)) {
        logger.error("[BroadcastChannel] Invalid message format:", message);
        return;
      }

      onMessage(message);
    };

    channel.onmessageerror = (event) => {
      logger.error("[BroadcastChannel] Message error:", event);
      onError?.(event);
    };

    channelRef.current = channel;
    return () => channel.close();
  }, [onMessage, onError]);

  const broadcast = useCallback(
    (message: BroadcastMessage) => {
      try {
        channelRef.current?.postMessage(message);
      } catch (error) {
        logger.error("[BroadcastChannel] Failed to broadcast:", error);
        onError?.(error as Error);
      }
    },
    [onError]
  );

  return { broadcast };
}
