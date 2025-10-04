import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useBroadcastSync } from "../useBroadcastSync";
import type { BroadcastMessage } from "../../types/spreadsheet";

vi.mock("../../utils/timestamp", () => ({
  getTimestamp: vi.fn(() => 1234567890),
}));

describe("useBroadcastSync", () => {
  let mockChannel: {
    postMessage: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    onmessage: ((event: MessageEvent) => void) | null;
  };

  beforeEach(() => {
    mockChannel = {
      postMessage: vi.fn(),
      close: vi.fn(),
      onmessage: null,
    };

    globalThis.BroadcastChannel = vi.fn().mockImplementation(() => mockChannel) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a BroadcastChannel on mount", () => {
    const onMessage = vi.fn();
    renderHook(() => useBroadcastSync({ onMessage }));

    expect(globalThis.BroadcastChannel).toHaveBeenCalledWith("spreadsheet-sync");
  });

  it("sets up onmessage handler", () => {
    const onMessage = vi.fn();
    renderHook(() => useBroadcastSync({ onMessage }));

    expect(mockChannel.onmessage).toBeDefined();
  });

  it("calls onMessage when receiving broadcast", () => {
    const onMessage = vi.fn();
    renderHook(() => useBroadcastSync({ onMessage }));

    const message: BroadcastMessage = {
      cellId: "A1",
      rawInput: "test",
      computedValue: "test",
      timestamp: 1234567890,
    };

    act(() => {
      mockChannel.onmessage?.(
        new MessageEvent("message", { data: message })
      );
    });

    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("broadcasts messages via postMessage", () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() => useBroadcastSync({ onMessage }));

    const message: BroadcastMessage = {
      cellId: "B2",
      rawInput: "hello",
      computedValue: "hello",
      timestamp: 1234567890,
    };

    act(() => {
      result.current.broadcast(message);
    });

    expect(mockChannel.postMessage).toHaveBeenCalledWith(message);
  });

  it("closes channel on unmount", () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() => useBroadcastSync({ onMessage }));

    unmount();

    expect(mockChannel.close).toHaveBeenCalled();
  });
});
