import { FoodSchema, type AppState } from '@nourish/core';
/** Persistent personal library, isolated by account, with no automatic expiry. */
export class FoodCache {
  private key: string;
  constructor(
    private storage: Pick<Storage, 'getItem' | 'setItem'>,
    ownerId: string,
  ) {
    this.key = 'nourish:personal-foods:v1:' + ownerId;
  }
  read(): AppState['custom'] | null {
    try {
      const raw = this.storage.getItem(this.key);
      return raw === null ? null : FoodSchema.array().max(10000).parse(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  write(foods: AppState['custom']) {
    try {
      this.storage.setItem(this.key, JSON.stringify(FoodSchema.array().max(10000).parse(foods)));
    } catch {}
  }
}
