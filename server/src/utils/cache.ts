// 単純なメモリキャッシュ（TTL付き）

type Entry<T> = { expiresAt: number; data: T };

class MemoryCache {
  private store = new Map<string, Entry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (entry.expiresAt < now) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiresAt });
  }

  del(key: string) {
    this.store.delete(key);
  }
}

export const cache = new MemoryCache();

