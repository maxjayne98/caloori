import { emptyState, validateState, type AppState } from '@nourish/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RevisionConflict, type NourishRepository, type Snapshot } from './repository';
/** Supabase is one replaceable adapter; the rest of the monorepo has no Supabase dependency. */
export class SupabaseRepository implements NourishRepository {
  readonly kind = 'supabase' as const;
  constructor(
    private client: SupabaseClient,
    private ownerId: string,
  ) {}
  private async requireOwner() {
    const { data, error } = await this.client.auth.getUser();
    if (error || data.user?.id !== this.ownerId)
      throw new Error('Please sign in again before accessing this data.');
  }
  async load(): Promise<Snapshot> {
    await this.requireOwner();
    const { data, error } = await this.client
      .from('nourish_documents')
      .select('data, revision')
      .eq('user_id', this.ownerId)
      .maybeSingle();
    if (error)
      throw new Error('Could not load your data. Check the database setup and connection.');
    if (!data) return { state: emptyState(), revision: 0 };
    return { state: validateState(data.data), revision: Number(data.revision) };
  }
  async save(state: AppState, expectedRevision: number) {
    await this.requireOwner();
    const { data, error } = await this.client.rpc('save_nourish_document', {
      p_data: validateState(state),
      p_expected_revision: expectedRevision,
      p_expected_user_id: this.ownerId,
    });
    if (error) {
      if (error.code === '40001') throw new RevisionConflict();
      throw new Error(
        'Could not save to the database. Your unsaved changes remain on this screen.',
      );
    }
    if (!Number.isSafeInteger(Number(data)))
      throw new Error('The database returned an invalid revision.');
    return Number(data);
  }
}
