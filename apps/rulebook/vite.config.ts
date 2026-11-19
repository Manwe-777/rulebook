import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** The icon package lists five font formats; keep only woff2 so the others (one is 7 MB) aren't copied into dist. */
function iconFontWoff2Only(): Plugin {
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

export default defineConfig({
  // Absolute so nested pages find their assets. Set BASE_PATH (e.g. /rulebook/) when hosting under a sub-path.
  base: process.env.BASE_PATH ?? '/',
  plugins: [iconFontWoff2Only(), tailwindcss(), react()],
});
