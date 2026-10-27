import { validateState } from '@nourish/core';
import type { Snapshot } from './repository';
export const SNAPSHOT_CACHE_PREFIX = 'nourish:cloud-session:v1:';
type CacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
/** Short-lived, account-scoped snapshots. Cache failures never block cloud access. */
export class SnapshotCache {
  private key: string;
  private active = true;
  constructor(
    private storage: CacheStorage,
    ownerId: string,
    private now = Date.now,
  ) {
    this.key = SNAPSHOT_CACHE_PREFIX + ownerId;
  }
  read(): Snapshot | null {
    if (!this.active) return null;
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      const age = this.now() - value.savedAt;
      if (
        !Number.isFinite(value.savedAt) ||
        !Number.isFinite(age) ||
        age < 0 ||
        age >= 60_000 ||
        !Number.isSafeInteger(value.revision) ||
        value.revision < 0
      )
        return null;
      return { state: validateState(value.state), revision: value.revision };
    } catch {
      return null;
    }
  }
  write(snapshot: Snapshot) {
    if (!this.active) return;
    try {
      this.storage.setItem(
        this.key,
        JSON.stringify({ ...snapshot, state: validateState(snapshot.state), savedAt: this.now() }),
      );
    } catch {
      /* Storage can be full or disabled. */
    }
  }
  dispose() {
    this.active = false;
    this.clear();
  }
  clear() {
    try {
      this.storage.removeItem(this.key);
    } catch {}
  }
}
