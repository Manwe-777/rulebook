import type { Plugin } from 'vite';

/** The icon package lists five font formats; keep only woff2 so the others (one is 7 MB) aren't copied into dist. */
export function iconFontWoff2Only(): Plugin {
  return {
    name: 'icon-font-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('wh40k-icon') || !id.endsWith('warhammer40k.css')) return;

      return code.replace(
        /@font-face\s*{[^}]*}/,
        `@font-face { font-family: "warhammer40k"; src: url('warhammer40k.woff2') format('woff2'); font-display: block; }`,
      );
    },
  };
}
