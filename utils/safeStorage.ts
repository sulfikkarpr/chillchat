// Safe storage wrapper that handles AsyncStorage import errors gracefully

let AsyncStorage: any = null;
let storageAvailable = false;

// Try to import AsyncStorage safely
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storageAvailable = true;
} catch (error) {
  console.warn('AsyncStorage not available:', error);
  storageAvailable = false;
}

// In-memory fallback storage
class MemoryStorage {
  private data: { [key: string]: string } = {};

  async getItem(key: string): Promise<string | null> {
    return this.data[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.data[key];
  }

  async clear(): Promise<void> {
    this.data = {};
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, this.data[key] || null]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.data[key] = value;
    });
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(this.data);
  }
}

// Create storage instance
const memoryStorage = new MemoryStorage();

// Safe storage interface
export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (storageAvailable && AsyncStorage) {
        return await AsyncStorage.getItem(key);
      } else {
        return await memoryStorage.getItem(key);
      }
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return await memoryStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (storageAvailable && AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      } else {
        await memoryStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Storage setItem error, using memory storage:', error);
      await memoryStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (storageAvailable && AsyncStorage) {
        await AsyncStorage.removeItem(key);
      } else {
        await memoryStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Storage removeItem error:', error);
      await memoryStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    try {
      if (storageAvailable && AsyncStorage) {
        await AsyncStorage.clear();
      } else {
        await memoryStorage.clear();
      }
    } catch (error) {
      console.warn('Storage clear error:', error);
      await memoryStorage.clear();
    }
  },

  isAsyncStorageAvailable(): boolean {
    return storageAvailable;
  },

  getStorageType(): string {
    return storageAvailable ? 'AsyncStorage' : 'MemoryStorage';
  }
};

export default safeStorage;