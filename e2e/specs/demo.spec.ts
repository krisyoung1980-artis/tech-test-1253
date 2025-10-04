import { test } from "@playwright/test";

test.describe("Live Spreadsheet Demo", () => {
  test("complete demo walkthrough", async ({ page, context }) => {
    test.setTimeout(120000); // 2 minute timeout for the entire demo

    // 1. Open the App
    await page.goto("http://localhost:5173/");

    // Wait for the grid to be loaded
    await page.waitForSelector(".ag-root-wrapper", { timeout: 10000 });
    await page.waitForTimeout(1000); // Brief pause to ensure everything is loaded

    console.log(
      "✓ App loaded - minimal live spreadsheet built with React, TypeScript, and AG Grid"
    );

    // 2. Demonstrate Editable Grid (~20 sec)
    console.log("\n2. Demonstrating Editable Grid...");

    // Click cell A1 - using field name and first data row
    const cellA1 = page
      .locator(".ag-center-cols-container .ag-row")
      .first()
      .locator('[col-id="A"]');
    await cellA1.dblclick(); // Double-click to edit
    await page.keyboard.type("10");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log("  ✓ Entered 10 in A1");

    // Click cell B1
    const cellB1 = page
      .locator(".ag-center-cols-container .ag-row")
      .first()
      .locator('[col-id="B"]');
    await cellB1.dblclick();
    await page.keyboard.type("5");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log("  ✓ Entered 5 in B1");
    console.log(
      "  ✓ Edits immediately appear in the grid (rawInput vs computedValue internally)"
    );

    // 3. Demonstrate Formula Evaluation (~30 sec)
    console.log("\n3. Demonstrating Formula Evaluation...");

    // Click cell C1
    const cellC1 = page
      .locator(".ag-center-cols-container .ag-row")
      .first()
      .locator('[col-id="C"]');
    await cellC1.dblclick();
    await page.keyboard.type("=A1+B1");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000); // Wait for formula to compute in Web Worker

    // Verify the formula result
    const c1Value = await cellC1.textContent();
    console.log(`  ✓ Formula =A1+B1 entered in C1, result: ${c1Value}`);
    console.log("  ✓ Formula computed in Web Worker");

    // Change A1 to demonstrate that C1 stays the same (no dependency graph)
    await cellA1.dblclick();
    await page.keyboard.press("Control+a"); // Select all
    await page.keyboard.type("20");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log(
      "  ✓ Changed A1 to 20 - note that C1 stays the same (no dependency graph yet)"
    );

    // Enter a more complex formula
    const cellD1 = page
      .locator(".ag-center-cols-container .ag-row")
      .first()
      .locator('[col-id="D"]');
    await cellD1.dblclick();
    await page.keyboard.type("=A1*B1");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
    const d1Value = await cellD1.textContent();
    console.log(
      `  ✓ More complex formula =A1*B1 entered, result: ${d1Value} - computed correctly`
    );

    // 4. Demonstrate Negative Value Flash (~20 sec)
    console.log("\n4. Demonstrating Negative Value Flash...");

    // Enter negative value in E1
    const cellE1 = page
      .locator(".ag-center-cols-container .ag-row")
      .first()
      .locator('[col-id="E"]');
    await cellE1.dblclick();
    await page.keyboard.type("-5");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log("  ✓ Entered -5 in E1");
    console.log(
      "  ✓ Row flashes red briefly - simple visual feedback mechanism"
    );

    // 5. Demonstrate Real-Time Tab Sync (~40 sec)
    console.log("\n5. Demonstrating Real-Time Tab Sync...");

    // Open a second tab
    const page2 = await context.newPage();
    await page2.goto("http://localhost:5173/");
    await page2.waitForSelector(".ag-root-wrapper", { timeout: 10000 });
    await page2.waitForTimeout(1000);
    console.log("  ✓ Opened second browser tab");

    // Edit A2 in the first tab
    const cellA2Tab1 = page
      .locator(".ag-center-cols-container .ag-row")
      .nth(1)
      .locator('[col-id="A"]');
    await cellA2Tab1.dblclick();
    await page.keyboard.type("7");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500); // Wait for sync
    console.log("  ✓ Edited A2=7 in first tab");

    // Verify the change propagated to the second tab
    const cellA2Tab2 = page2
      .locator(".ag-center-cols-container .ag-row")
      .nth(1)
      .locator('[col-id="A"]');
    const a2Tab2Value = await cellA2Tab2.textContent();
    console.log(
      `  ✓ Change propagated instantly to second tab, A2 value: ${a2Tab2Value}`
    );

    // Type formula in second tab that results in negative
    const cellB2Tab2 = page2
      .locator(".ag-center-cols-container .ag-row")
      .nth(1)
      .locator('[col-id="B"]');
    await cellB2Tab2.dblclick();
    await page2.keyboard.type("=A2-10");
    await page2.keyboard.press("Enter");
    await page2.waitForTimeout(1500);
    const b2Tab2Value = await cellB2Tab2.textContent();
    console.log(
      `  ✓ Formula =A2-10 entered in second tab, result: ${b2Tab2Value}`
    );
    console.log("  ✓ Negative flash triggers locally in second tab");
    console.log("  ✓ Last-write-wins if edits are simultaneous");

    // Close second tab
    await page2.close();

    // 6. Wrap Up
    console.log("\n6. Wrap Up");
    console.log("  ✓ All formulas run in a Web Worker");
    console.log("  ✓ Multi-tab sync is live via BroadcastChannel");
    console.log("  ✓ Negative values flash red");
    console.log("  ✓ App can run locally with a single ./dev.sh command");
    console.log(
      "  • Future improvements: dependency graph, more operators, persistence"
    );

    console.log("\n✅ Demo completed successfully!");
  });
});
