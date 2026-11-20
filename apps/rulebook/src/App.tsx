import { lazy, Suspense } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';

import ConnectionBadge from './components/common/ConnectionBadge';
import SourceStatusLine from './components/common/SourceStatusLine';
import DetachmentPage from './components/pages/DetachmentPage';
import FactionPage from './components/pages/FactionPage';
import HomePage from './components/pages/HomePage';
import NotFoundPage from './components/pages/NotFoundPage';
import UnitPage from './components/pages/UnitPage';
import { BUILDER_URL, ICON_CREDIT, SITE_NAME } from './constants';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useLibrary } from './hooks/useLibrary';
import { titleForPath } from './library/titleForPath';

// Pages for contributors load when opened, so readers never download the editor.
const AccountPage = lazy(() => import('./components/account/AccountPage'));
const FactionWorkspace = lazy(() => import('./components/editor/FactionWorkspace'));
const RecordEditor = lazy(() => import('./components/editor/RecordEditor'));
// The army sheet the list builder links to.
const PrintPage = lazy(() => import('./components/print/PrintPage'));
const AdminPage = lazy(() => import('./components/admin/AdminPage'));

/** Page layout and routes. The router and library provider are set up by the client or server entry. */
export default function App() {
  const library = useLibrary();

  useDocumentTitle(titleForPath(library, useLocation().pathname));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 font-sans text-text print:max-w-none print:p-0">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 print:hidden">
        <Link to="/" className="text-3xl font-extrabold tracking-wide uppercase">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4">
          <ConnectionBadge />
          {BUILDER_URL && (
            <a href={BUILDER_URL} className="text-sm font-semibold tracking-wide uppercase hover:underline">
              List builder
            </a>
          )}
          <Link to="/admin" className="text-sm font-semibold tracking-wide uppercase hover:underline">
            Admin
          </Link>
          <Link to="/account" className="text-sm font-semibold tracking-wide uppercase hover:underline">
            Account
          </Link>
        </nav>
      </header>
      <Suspense fallback={<p className="text-text/70">Loading…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:faction" element={<FactionPage />} />
          <Route path="/:faction/:unit" element={<UnitPage />} />
          <Route path="/:faction/detachment/:detachment" element={<DetachmentPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/:faction/edit" element={<FactionWorkspace />} />
          <Route path="/:faction/edit/:kind/:id" element={<RecordEditor />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <footer className="mt-auto text-xs text-text/60 print:hidden">
        Icons:{' '}
        <a href={ICON_CREDIT.url} className="underline">
          {ICON_CREDIT.label}
        </a>
        . Rules text is written by the community and is not official Games Workshop material. <SourceStatusLine />
      </footer>
    </main>
  );
}
