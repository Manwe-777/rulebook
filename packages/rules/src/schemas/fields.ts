import { z } from 'zod';

import { ROLES } from '../constants';

/** Stat values may be written as numbers (`5`) or text (`6"`, `5+`, `D6`); both are kept as text. */
export const stat = z.union([z.string().min(1), z.number()]).transform(String);

export const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase words joined by hyphens');

export const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'must be a hex colour like #8f1d1d');

export const iconName = z.string().regex(/^[a-z0-9-]+$/, 'must be a lowercase icon name like adeptus-astartes');

export const text = z.string().min(1);

/** Keyword lists; empty when left out. */
export const keywords = z.array(text).default([]);

export const points = z.int().min(0);

export const count = z.int().min(0);

export const share = z.number().min(0).max(1);

export const role = z.enum(ROLES);
