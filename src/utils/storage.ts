import type { SpreadsheetState } from "../types/spreadsheet";

const DB_NAME = "spreadsheet-db";
const DB_VERSION = 1;
const STORE_NAME = "state";
const STATE_KEY = "spreadsheet-state";

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error as Error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveToIndexedDB = async (data: SpreadsheetState): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, STATE_KEY);

    request.onerror = () => {
      db.close();
      reject(request.error as Error);
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error as Error);
    };
  });
};

export const loadFromIndexedDB = async (): Promise<SpreadsheetState | undefined> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    request.onerror = () => {
      db.close();
      reject(request.error as Error);
    };

    request.onsuccess = () => {
      db.close();
      resolve(request.result as SpreadsheetState | undefined);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error as Error);
    };
  });
};
