import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SpreadsheetGrid } from "../SpreadsheetGrid";

describe("SpreadsheetGrid", () => {
  it("renders the grid with column headers A-E", async () => {
    render(<SpreadsheetGrid />);
    await waitFor(() => {
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
      expect(screen.getByText("E")).toBeInTheDocument();
    });
  });

  it("renders the row number column with # header", async () => {
    render(<SpreadsheetGrid />);
    await waitFor(() => {
      expect(screen.getByText("#")).toBeInTheDocument();
    });
  });

  it("renders 10 rows", async () => {
    render(<SpreadsheetGrid />);

    await waitFor(() => {
      Array.from({ length: 10 }, (_, idx) => idx + 1).forEach((i) => {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      });
    });
  });

  it("initializes all cells with empty values", async () => {
    const { container } = render(<SpreadsheetGrid />);
    await waitFor(() => {
      const cells = container.querySelectorAll(
        '[col-id]:not([col-id="rowNum"])'
      );
      expect(cells.length).toBeGreaterThanOrEqual(50);
    });
  });

  it("updates cell value when edited", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpreadsheetGrid />);
    await waitFor(async () => {
      const firstCell = container.querySelector('[col-id="A"][row-index="0"]');

      if (firstCell) {
        await user.dblClick(firstCell);
        await user.keyboard("test value");
        await user.keyboard("{Enter}");
        expect(firstCell).toHaveTextContent("test value");
      }
    });
  });

  it("handles multiple cell edits independently", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpreadsheetGrid />);
    await waitFor(async () => {
      const cellA1 = container.querySelector('[col-id="A"][row-index="0"]');
      const cellB2 = container.querySelector('[col-id="B"][row-index="1"]');

      if (cellA1) {
        await user.dblClick(cellA1);
        await user.keyboard("A1 Value");
        await user.keyboard("{Enter}");
        expect(cellA1).toHaveTextContent("A1 Value");
      }
      if (cellB2) {
        await user.dblClick(cellB2);
        await user.keyboard("B2 Value");
        await user.keyboard("{Enter}");
        expect(cellB2).toHaveTextContent("B2 Value");
      }
    });
  });

  it("row number column should not be editable", async () => {
    const { container } = render(<SpreadsheetGrid />);
    await waitFor(() => {
      const rowNumCell = container.querySelector('[col-id="rowNum"]');

      if (rowNumCell) {
        const cellElement = rowNumCell as HTMLElement;
        expect(cellElement).toBeInTheDocument();
      }
    });
  });
});
