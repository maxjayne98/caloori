import type { AppState } from '@nourish/core';

export type RepositoryKind = 'local' | 'memory' | 'supabase';
export interface Snapshot {
  state: AppState;
  revision: number;
}
/** UI and domain code depend on this interface, never a database SDK. */
export interface NourishRepository {
  readonly kind: RepositoryKind;
  load(): Promise<Snapshot>;
  refreshFoods?(): Promise<Snapshot>;
  acceptSnapshot?(snapshot: Snapshot): void;
  save(state: AppState, expectedRevision: number): Promise<number>;
}
export class RevisionConflict extends Error {
  constructor() {
    super('This data changed on another device or tab. Export your changes before reloading.');
    this.name = 'RevisionConflict';
  }
}
