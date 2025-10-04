import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("error", () => {
    it("logs error messages with timestamp and level", () => {
      logger.error("Test error", { detail: "info" });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\]/
        ),
        "Test error",
        { detail: "info" }
      );
    });

    it("logs error without additional args", () => {
      logger.error("Simple error");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        "Simple error"
      );
    });
  });

  describe("warn", () => {
    it("logs warning messages with timestamp and level", () => {
      logger.warn("Test warning", { detail: "info" });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[WARN\]/
        ),
        "Test warning",
        { detail: "info" }
      );
    });

    it("logs warning without additional args", () => {
      logger.warn("Simple warning");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[WARN\]/),
        "Simple warning"
      );
    });
  });

  describe("info", () => {
    it("logs info messages with timestamp and level", () => {
      logger.info("Test info", { detail: "data" });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\]/
        ),
        "Test info",
        { detail: "data" }
      );
    });

    it("logs info without additional args", () => {
      logger.info("Simple info");

      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\]/),
        "Simple info"
      );
    });
  });
});
