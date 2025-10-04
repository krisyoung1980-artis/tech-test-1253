# Tech Task: Spreadsheet

A simple spreadsheet application built with React, TypeScript, and AG Grid that syncs across browser tabs.

## Features

- **10x10 Grid**: Spreadsheet with columns A-J and rows 1-10
- **Formula Support**: Evaluate formulas starting with `=` (e.g., `=A1+B2*3`)
- **Cell References**: Reference other cells in formulas (case-insensitive)
- **Live Sync**: Changes automatically sync across all open tabs using BroadcastChannel API
- **Web Worker**: Formula evaluation runs in a background worker to keep UI responsive
- **Conflict Resolution**: Last-write-wins with timestamp-based conflict resolution
- **Visual Feedback**: Rows flash red when any cell becomes negative
- **Persistent State**: Automatically saves to IndexedDB and restores on reload

## Getting Started

### Quick Start

```bash
./dev.sh
```

This script automatically installs dependencies (if needed) and starts the dev server.

### Manual Setup

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Run tests with UI
```

## Testing the Functionality

### Basic Usage

1. **Enter Values**: Click any cell and type a value or text
2. **Enter Formulas**: Type `=` followed by an expression (e.g., `=5+3`, `=A1*2`, `=A1+B1-C1`)
3. **Cell References**: Reference any cell by its ID (e.g., `A1`, `b2`, `J10`)
4. **Negative Flash**: Enter a formula that results in a negative number and watch the row flash red

### Multi-Tab Sync

1. Open the app in multiple browser tabs
2. Make changes in one tab
3. Watch changes appear instantly in all other tabs
4. Conflicts are resolved automatically (most recent change wins)

### Supported Operations

- Addition: `=1+2`
- Subtraction: `=5-3`
- Multiplication: `=4*3`
- Division: `=10/2`
- Cell references: `=A1+B2`
- Complex formulas: `=A1*2-B1/3+C1`

## Architecture

### Key Design Decisions

**1. Custom Expression Parser**

- Basic but safe, recursive expression parser
- Only evaluates arithmetic operations (+, -, \*, /)
- Limits security risks from arbitrary code execution
- Simple algorithm: find lowest precedence operator, split, recurse

**2. Web Workers**

- Formula evaluation runs in a background worker thread
- Storage operations (IndexedDB) run in a separate worker
- Prevents UI blocking on complex calculations and I/O
- Workers are reused for all operations

**3. BroadcastChannel for Sync**

- Lightweight, native browser API for tab-to-tab communication
- No server required for real-time sync
- Works within same origin only

**4. Timestamp-based Conflict Resolution**

- Each cell update includes a timestamp
- Remote updates with older timestamps are ignored
- Simple last-write-wins strategy

**5. Declarative Row Styling**

- Cells with negative values get `negative-cell` class
- CSS `:has()` selector applies animation to parent row
- No state pollution with temporary flash flags
- Animation re-triggers automatically on value changes

**6. AG Grid Cell Class Pattern**

- `cellClass` function checks if value is negative
- Re-evaluates when cell data changes
- Purely declarative with no imperative API calls

### Trade-offs

**Performance vs Simplicity**

- Array slicing in parser creates new arrays (slower but clearer)
- Could optimize with index-based parsing if needed
- Current approach is sufficient for small expressions

**Conflict Resolution**

- Last-write-wins is simple but can lose data
- More sophisticated CRDTs could preserve all edits
- Acceptable for this use case

**IndexedDB via Web Worker**

- Asynchronous storage doesn't block UI thread
- Storage operations run in background worker for better performance
- Saves on every state change without blocking the main thread

**BroadcastChannel Limitations**

- Only works within same origin
- Can't sync across devices or browsers
- Adequate for only simple tab sync

## Project Structure

```
src/
├── components/          # React components
│   └── SpreadsheetGrid.tsx
├── constants/          # Grid configuration
│   └── grid.ts
├── hooks/              # Custom React hooks
│   ├── useBroadcastSync.ts
│   ├── useFormulaWorker.ts
│   ├── useSpreadsheetController.ts
│   └── useSpreadsheetState.ts
├── types/              # TypeScript types
│   └── spreadsheet.d.ts
├── utils/              # Utility functions
│   ├── createInitialState.ts
│   ├── formulaEvaluator.ts
│   ├── gridHelpers.ts
│   └── timestamp.ts
├── workers/            # Web Workers
│   ├── formulaWorker.ts
│   └── storageWorker.ts
└── __specs__/          # Test files
```

## Technologies

- **React 19**: UI framework
- **TypeScript**: Type safety
- **AG Grid 34**: Spreadsheet grid component
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **Web Workers**: Background formula evaluation and storage
- **BroadcastChannel API**: Cross-tab communication
- **IndexedDB API**: Persistent state storage
