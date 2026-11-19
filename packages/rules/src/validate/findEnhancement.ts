import type { Enhancement } from '../types';
import type { ValidationContext } from './types';

/** An enhancement or upgrade from one of the army's chosen detachments. */
export function findEnhancement(ctx: ValidationContext, id: string): Enhancement | undefined {
  return ctx.detachments.flatMap((d) => d.enhancements).find((e) => e.id === id);
}
