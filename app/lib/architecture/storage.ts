// Storage layer for persisting home designs
import { HomeDefinition } from './types';
import { Synchronizer, FormatConverter } from './synchronizer';

/**
 * StorageProvider handles persisting and retrieving home designs
 */
export interface StorageProvider {
  save(key: string, home: HomeDefinition, format: 'json' | 'sh3d'): Promise<void>;
  load(key: string, format: 'json' | 'sh3d'): Promise<HomeDefinition | null>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}

/**
 * LocalStorageProvider - stores in browser's localStorage
 */
export class LocalStorageProvider implements StorageProvider {
  private prefix = 'sh3d_';

  async save(key: string, home: HomeDefinition, format: 'json' | 'sh3d'): Promise<void> {
    try {
      const fullKey = `${this.prefix}${key}`;
      let data: string;

      if (format === 'sh3d') {
        const sh3dData = FormatConverter.toSH3DFormat(home);
        data = JSON.stringify(sh3dData);
      } else {
        data = Synchronizer.exportToJSON(home);
      }

      // Store with metadata
      const stored = {
        format,
        data,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(fullKey, JSON.stringify(stored));
    } catch (error) {
      throw new Error(`Failed to save home: ${error}`);
    }
  }

  async load(key: string, format: 'json' | 'sh3d'): Promise<HomeDefinition | null> {
    try {
      const fullKey = `${this.prefix}${key}`;
      const stored = localStorage.getItem(fullKey);

      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const jsonString = parsed.data;

      if (format === 'sh3d' && parsed.format === 'sh3d') {
        const sh3dData = JSON.parse(jsonString);
        return FormatConverter.fromSH3DFormat(sh3dData);
      } else {
        const result = Synchronizer.importFromJSON(jsonString);
        return result.home;
      }
    } catch (error) {
      throw new Error(`Failed to load home: ${error}`);
    }
  }

  async delete(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    localStorage.removeItem(fullKey);
  }

  async list(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
}

/**
 * IndexedDBProvider - stores in IndexedDB (better for large files)
 */
export class IndexedDBProvider implements StorageProvider {
  private dbName = 'SweetHome3DProjects';
  private storeName = 'homes';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async save(key: string, home: HomeDefinition, format: 'json' | 'sh3d'): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      let data: string;
      if (format === 'sh3d') {
        const sh3dData = FormatConverter.toSH3DFormat(home);
        data = JSON.stringify(sh3dData);
      } else {
        data = Synchronizer.exportToJSON(home);
      }

      const stored = {
        key,
        format,
        data,
        savedAt: new Date().toISOString(),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(stored);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new Error(`Failed to save home: ${error}`);
    }
  }

  async load(key: string, format: 'json' | 'sh3d'): Promise<HomeDefinition | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const stored = request.result;
          if (!stored) {
            resolve(null);
            return;
          }

          const jsonString = stored.data;

          if (format === 'sh3d' && stored.format === 'sh3d') {
            const sh3dData = JSON.parse(jsonString);
            resolve(FormatConverter.fromSH3DFormat(sh3dData));
          } else {
            const result = Synchronizer.importFromJSON(jsonString);
            resolve(result.home);
          }
        };
      });
    } catch (error) {
      throw new Error(`Failed to load home: ${error}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new Error(`Failed to delete home: ${error}`);
    }
  }

  async list(): Promise<string[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const keys = request.result as string[];
          resolve(keys);
        };
      });
    } catch (error) {
      throw new Error(`Failed to list homes: ${error}`);
    }
  }
}

/**
 * StorageManager - high-level API for storage operations
 */
export class StorageManager {
  private provider: StorageProvider;

  constructor(provider: StorageProvider = new LocalStorageProvider()) {
    this.provider = provider;
  }

  async save(key: string, home: HomeDefinition, format: 'json' | 'sh3d' = 'json'): Promise<void> {
    return this.provider.save(key, home, format);
  }

  async load(key: string, format: 'json' | 'sh3d' = 'json'): Promise<HomeDefinition | null> {
    return this.provider.load(key, format);
  }

  async delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }

  async list(): Promise<string[]> {
    return this.provider.list();
  }

  /**
   * Auto-save functionality
   */
  autoSave(key: string, home: HomeDefinition, intervalMs: number = 30000): () => void {
    const interval = setInterval(() => {
      this.save(key, home, 'json').catch((error) => {
        console.error('Auto-save failed:', error);
      });
    }, intervalMs);

    // Return function to stop auto-save
    return () => clearInterval(interval);
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{ used: number; total: number; percentage: number }> {
    if (!navigator.storage?.estimate) {
      return { used: 0, total: 0, percentage: 0 };
    }

    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || 0;

    return {
      used,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0,
    };
  }
}
