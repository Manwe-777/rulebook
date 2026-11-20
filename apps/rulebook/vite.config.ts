import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { iconFontWoff2Only } from '../../tooling/iconFontWoff2Only';
import { vendorChunks } from '../../tooling/vendorChunks';

// Absolute so nested pages find their assets. Set BASE_PATH (e.g. /rulebook/) when hosting under a sub-path.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig(({ isSsrBuild }) => ({
  base,
  build: { rolldownOptions: { output: { codeSplitting: vendorChunks } } },
  plugins: [
    iconFontWoff2Only(),
    tailwindcss(),
    react(),
    // Installable, and the app itself works offline. Only for the browser build: the server build that prerenders
    // pages needs no service worker.
    !isSsrBuild &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        manifest: {
          id: base,
          name: 'Rulebook',
          short_name: 'Rulebook',
          description: 'Community-written Warhammer 40,000 rules: datasheets, detachments and stratagems.',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          background_color: '#1b1d1a',
          theme_color: '#3d4a26',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // The app shell, not the thousands of prerendered pages: any page opens from index.html offline.
          globPatterns: ['**/*.{js,css,woff2,svg,png}', 'index.html'],
          navigateFallback: 'index.html',
          // The list builder lives under this site's address but is a separate app with its own service worker.
          navigateFallbackDenylist: [new RegExp(`^${base}builder/`)],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
  ],
}));
