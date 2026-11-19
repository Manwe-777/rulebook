import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import App from './App';
import AccountProvider from './identity/AccountProvider';
import { bundledLibrary } from './library/bundledLibrary';
import { LibraryContext } from './library/LibraryContext';
import { pagePaths } from './library/pagePaths';
import { titleForPath } from './library/titleForPath';

/** Every page path to prerender. */
export const paths = pagePaths(bundledLibrary);

/** Renders one page to HTML, for `scripts/prerender.js`. */
export function render(path: string): { html: string; title: string } {
  const html = renderToString(
    <StrictMode>
      <LibraryContext value={bundledLibrary}>
        <AccountProvider>
          {/* Page paths are relative to the site; the router expects them under the base path. */}
          <StaticRouter
            location={`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`}
            basename={import.meta.env.BASE_URL}
          >
            <App />
          </StaticRouter>
        </AccountProvider>
      </LibraryContext>
    </StrictMode>,
  );

  return { html, title: titleForPath(bundledLibrary, path) };
}
