import { ROLE_CACHE_MS } from '../constants';
import { KEYS } from '../constants';
import { type Hidden, hiddenSchema, roleListSchema } from '../schemas';

/** Reads a shared value by key (from tool-db, or the relay's own data). */
export type Lookup = (key: string) => Promise<unknown>;

/**
 * Who holds which role, read from the role lists with a short cache. The owner key is fixed and is a maintainer of
 * every faction.
 */
export class Roles {
  private cache = new Map<string, { at: number; value: unknown }>();

  constructor(
    readonly owner: string,
    private lookup: Lookup,
    private cacheMs = ROLE_CACHE_MS,
  ) {}

  private async read(key: string): Promise<unknown> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.at < this.cacheMs) return cached.value;

    const value = await this.lookup(key).catch(() => null);

    this.cache.set(key, { at: Date.now(), value });

    return value;
  }

  private async list(key: string): Promise<string[]> {
    const parsed = roleListSchema.safeParse(await this.read(key));

    return parsed.success ? parsed.data.keys : [];
  }

  /** Forget cached lists, e.g. after changing one. */
  clear() {
    this.cache.clear();
  }

  async maintainers(faction: string): Promise<string[]> {
    return this.list(KEYS.maintainers(faction));
  }

  async contributors(faction: string): Promise<string[]> {
    return this.list(KEYS.contributors(faction));
  }

  async isMaintainer(faction: string, pubkey: string): Promise<boolean> {
    return pubkey === this.owner || (await this.maintainers(faction)).includes(pubkey);
  }

  /** Maintainers can do everything contributors can. */
  async isContributor(faction: string, pubkey: string): Promise<boolean> {
    return (await this.isMaintainer(faction, pubkey)) || (await this.contributors(faction)).includes(pubkey);
  }

  async hidden(): Promise<Hidden> {
    const parsed = hiddenSchema.safeParse(await this.read(KEYS.hidden));

    return parsed.success ? parsed.data : { keys: [], blobs: [], reason: '' };
  }
}
