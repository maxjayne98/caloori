import type { FoodCache } from './food-cache';
import type { SnapshotCache } from './snapshot-cache';
import { emptyState, validateState, type AppState } from '@nourish/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RevisionConflict, type NourishRepository, type Snapshot } from './repository';
/** Supabase is one replaceable adapter; the rest of the monorepo has no Supabase dependency. */
export class SupabaseRepository implements NourishRepository {
  readonly kind = 'supabase' as const;
  private libraryBaseline: AppState['custom'] = [];
  constructor(
    private client: SupabaseClient,
    private ownerId: string,
    private cache?: SnapshotCache,
    private foodCache?: FoodCache,
  ) {}
  private async requireOwner() {
    const { data, error } = await this.client.auth.getUser();
    if (error || data.user?.id !== this.ownerId) {
      this.cache?.clear();
      throw new Error('Please sign in again before accessing this data.');
    }
  }
  async load(): Promise<Snapshot> {
    await this.requireOwner();
    const library = this.foodCache?.read() ?? null;
    const cached = this.cache?.read();
    if (cached) {
      const custom = library ?? cached.state.custom;
      this.libraryBaseline = custom;
      this.foodCache?.write(custom);
      return { ...cached, state: { ...cached.state, custom } };
    }
    const { data, error } = await this.client
      .from('nourish_documents')
      .select(
        library === null
          ? 'data, revision'
          : 'profile:data->profile, entries:data->entries, weights:data->weights, templates:data->templates, activities:data->activities, revision',
      )
      .eq('user_id', this.ownerId)
      .returns<Array<Record<string, unknown>>>()
      .maybeSingle();
    if (error)
      throw new Error('Could not load your data. Check the database setup and connection.');
    const snapshot = data
      ? {
          state: validateState(
            library === null
              ? data.data
              : {
                  version: 1,
                  profile: data.profile,
                  entries: data.entries,
                  weights: data.weights,
                  templates: data.templates,
                  activities: data.activities,
                  custom: library,
                },
          ),
          revision: Number(data.revision),
        }
      : { state: emptyState(), revision: 0 };
    this.libraryBaseline = snapshot.state.custom;
    this.foodCache?.write(snapshot.state.custom);
    this.cache?.write(snapshot);
    return snapshot;
  }
  async refreshFoods(): Promise<Snapshot> {
    await this.requireOwner();
    const { data, error } = await this.client
      .from('nourish_documents')
      .select('data, revision')
      .eq('user_id', this.ownerId)
      .maybeSingle();
    if (error) throw new Error('Could not refresh foods. Your current library is unchanged.');
    const snapshot = data
      ? { state: validateState(data.data), revision: Number(data.revision) }
      : { state: emptyState(), revision: 0 };
    return snapshot;
  }
  acceptSnapshot(snapshot: Snapshot) {
    this.libraryBaseline = snapshot.state.custom;
    this.foodCache?.write(snapshot.state.custom);
    this.cache?.write(snapshot);
  }
  async save(state: AppState, expectedRevision: number) {
    await this.requireOwner();
    const valid = validateState(state);
    const saveLibrary = JSON.stringify(valid.custom) !== JSON.stringify(this.libraryBaseline);
    const { data, error } = await this.client.rpc(
      this.foodCache ? 'save_nourish_cached_document' : 'save_nourish_document',
      {
        p_data: this.foodCache && !saveLibrary ? { ...valid, custom: [] } : valid,
        p_expected_revision: expectedRevision,
        p_expected_user_id: this.ownerId,
        ...(this.foodCache
          ? {
              p_save_custom: saveLibrary,
              p_expected_custom: saveLibrary ? this.libraryBaseline : [],
            }
          : {}),
      },
    );
    if (error) {
      if (error.code === '40001') {
        this.cache?.clear();
        throw new RevisionConflict();
      }
      throw new Error(
        'Could not save to the database. Your unsaved changes remain on this screen.',
      );
    }
    if (!Number.isSafeInteger(Number(data)))
      throw new Error('The database returned an invalid revision.');
    this.libraryBaseline = valid.custom;
    this.foodCache?.write(valid.custom);
    this.cache?.write({ state: valid, revision: Number(data) });
    return Number(data);
  }
}
