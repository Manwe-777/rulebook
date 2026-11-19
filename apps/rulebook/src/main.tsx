/* Imported here rather than from styles.css so Vite (not Tailwind) loads it and vite.config.ts can drop the
   unused font formats. It only sets the icon font and glyphs, so it doesn't need to be in a layer. */
import '@nanoseeds/wh40k-icon/dist/warhammer40k.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App';
import AccountProvider from './identity/AccountProvider';
import LibraryProvider from './library/LibraryProvider';

const root = document.getElementById('root')!;

const app = (
  <StrictMode>
    <LibraryProvider>
      <AccountProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </AccountProvider>
    </LibraryProvider>
  </StrictMode>
);

const trimSlashes = (path: string) => path.replace(/^\/+|\/+$/g, '');
const routePath = trimSlashes(location.pathname.slice(import.meta.env.BASE_URL.length - 1));

// Prerendered pages hold markup for the path in data-path. A host may serve another page's file as a fallback, so only
// hydrate when it matches; otherwise render from scratch.
if (root.dataset.path !== undefined && trimSlashes(root.dataset.path) === routePath) hydrateRoot(root, app);
else {
  root.replaceChildren();
  createRoot(root).render(app);
}
