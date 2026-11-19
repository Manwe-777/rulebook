import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Set BASE_PATH (e.g. /builder/) when hosting under a sub-path.
  base: process.env.BASE_PATH ?? '/',
  plugins: [tailwindcss(), react()],
});
