import { useEffect, useRef } from "react";
import type { BroadcastMessage } from "../types/spreadsheet";

interface UseBroadcastSyncOptions {
  onMessage: (message: BroadcastMessage) => void;
  onError?: (error: MessageEvent | Error) => void;
}

export function useBroadcastSync({ onMessage, onError }: UseBroadcastSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("spreadsheet-sync");

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) =>
      onMessage(event.data);

    channel.onmessageerror = (event) => {
      console.error("[BroadcastChannel] Message error:", event);
      onError?.(event);
    };

    channelRef.current = channel;
    return () => channel.close();
  }, [onMessage, onError]);

  const broadcast = (message: BroadcastMessage) => {
    try {
      channelRef.current?.postMessage(message);
    } catch (error) {
      console.error("[BroadcastChannel] Failed to broadcast:", error);
      onError?.(error as Error);
    }
  };

  return { broadcast };
}
