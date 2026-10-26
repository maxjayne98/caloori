import { emptyState, validateState, type AppState } from '@nourish/core';
import { RevisionConflict, type NourishRepository, type Snapshot } from './repository';
export const LOCAL_STORAGE_KEY = 'nourish-next:state:v1';
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export class LocalRepository implements NourishRepository {
  readonly kind = 'local' as const;
  constructor(
    private storage: KeyValueStorage,
    private key = LOCAL_STORAGE_KEY,
  ) {}
  async load(): Promise<Snapshot> {
    const text = this.storage.getItem(this.key);
    if (!text) return { state: emptyState(), revision: 0 };
    const record = JSON.parse(text);
    if (!Number.isSafeInteger(record.revision) || record.revision < 0)
      throw new Error('Invalid backup revision. Your data has not been overwritten.');
    return { state: validateState(record.state), revision: record.revision };
  }
  async save(state: AppState, expectedRevision: number): Promise<number> {
    const write = async () => {
      const current = await this.load();
      if (current.revision !== expectedRevision) throw new RevisionConflict();
      const next = current.revision + 1;
      this.storage.setItem(
        this.key,
        JSON.stringify({ state: validateState(state), revision: next }),
      );
      return next;
    };
    if (typeof navigator !== 'undefined' && navigator.locks)
      return navigator.locks.request(this.key, write);
    return write();
  }
}
