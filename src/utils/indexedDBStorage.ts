/**
 * Resilient IndexedDB persistent storage backup for Aura Finance.
 * Ensures data is preserved even if localStorage is purged or volatile in sandboxed frames.
 */

const DB_NAME = 'AuraFinanceDB';
const DB_VERSION = 1;
const STORE_NAME = 'vault';
const VAULT_KEY = 'current_user_vault';

export interface VaultSnapshot {
  transactions: unknown[];
  categories: unknown[];
  savingsGoals: unknown[];
  recurringBills: unknown[];
  settings: unknown;
  linkedPaymentApps?: unknown[];
  detectedExpenses?: unknown[];
  merchantRules?: unknown[];
  savedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToIndexedDB(snapshot: VaultSnapshot): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(snapshot, VAULT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Aura] IndexedDB save fallback ignored:', err);
  }
}

export async function loadFromIndexedDB(): Promise<VaultSnapshot | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VAULT_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Aura] IndexedDB read fallback ignored:', err);
    return null;
  }
}
