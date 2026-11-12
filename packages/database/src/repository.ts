import type { AppState } from '@nourish/core';

/** A browser push channel for meal reminders (Web Push subscription keys are public). */
export interface PushDevice {
  endpoint: string;
  p256dh: string;
  auth: string;
  timeZone: string;
  locale: string;
}
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
  /** Only repositories with a server can deliver push reminders. */
  savePushDevice?(device: PushDevice): Promise<void>;
  removePushDevice?(endpoint: string): Promise<void>;
}
export class RevisionConflict extends Error {
  constructor() {
    super('This data changed on another device or tab. Export your changes before reloading.');
    this.name = 'RevisionConflict';
  }
}
