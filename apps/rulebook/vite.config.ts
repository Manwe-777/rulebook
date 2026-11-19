import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { iconFontWoff2Only } from '../../tooling/iconFontWoff2Only';
import { vendorChunks } from '../../tooling/vendorChunks';

export default defineConfig({
  // Absolute so nested pages find their assets. Set BASE_PATH (e.g. /rulebook/) when hosting under a sub-path.
  base: process.env.BASE_PATH ?? '/',
  build: { rolldownOptions: { output: { codeSplitting: vendorChunks } } },
  plugins: [iconFontWoff2Only(), tailwindcss(), react()],
});
