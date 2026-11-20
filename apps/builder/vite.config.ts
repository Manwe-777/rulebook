import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { iconFontWoff2Only } from '../../tooling/iconFontWoff2Only';
import { vendorChunks } from '../../tooling/vendorChunks';

export default defineConfig({
  // Set BASE_PATH (e.g. /builder/) when hosting under a sub-path.
  base: process.env.BASE_PATH ?? '/',
  build: { rolldownOptions: { output: { codeSplitting: vendorChunks } } },
  plugins: [
    iconFontWoff2Only(),
    tailwindcss(),
    react(),
    // Installable and offline: the app is precached; rules come from the IndexedDB cache when the relays are out of
    // reach, and photos of models live in IndexedDB too.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        // Its own id, so Android keeps it apart from the rulebook installed from the same site.
        id: process.env.BASE_PATH ?? '/',
        name: 'Rulebook List Builder',
        short_name: 'List Builder',
        description: 'Build and check Warhammer 40,000 army lists with community-written rules.',
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
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
