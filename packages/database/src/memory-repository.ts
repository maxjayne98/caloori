import { emptyState, validateState, type AppState } from '@nourish/core';
import { RevisionConflict, type NourishRepository, type Snapshot } from './repository';
export class MemoryRepository implements NourishRepository {
  readonly kind = 'memory' as const;
  private snapshot: Snapshot = { state: emptyState(), revision: 0 };
  async load() {
    return structuredClone(this.snapshot);
  }
  async save(state: AppState, expectedRevision: number) {
    if (this.snapshot.revision !== expectedRevision) throw new RevisionConflict();
    this.snapshot = {
      state: structuredClone(validateState(state)),
      revision: expectedRevision + 1,
    };
    return this.snapshot.revision;
  }
}
