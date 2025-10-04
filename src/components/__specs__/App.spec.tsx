import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../App";

describe("App", () => {
  it("renders the SpreadsheetGrid component", () => {
    render(<App />);
    expect(document.querySelector(".container")).toBeInTheDocument();
  });
});
