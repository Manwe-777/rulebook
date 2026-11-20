import { lazy, Suspense } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router';

import ConnectionBadge from './components/common/ConnectionBadge';
import SourceStatusLine from './components/common/SourceStatusLine';
import CoreStratagemsPage from './components/pages/CoreStratagemsPage';
import DetachmentPage from './components/pages/DetachmentPage';
import FactionPage from './components/pages/FactionPage';
import HomePage from './components/pages/HomePage';
import NotFoundPage from './components/pages/NotFoundPage';
import UnitPage from './components/pages/UnitPage';
import { BUILDER_URL, DATA_SOURCE, ICON_CREDIT, SITE_NAME } from './constants';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useLibrary } from './hooks/useLibrary';
import { titleForPath } from './library/titleForPath';

const LINK = 'text-sm font-semibold tracking-wide uppercase hover:underline';
const CURRENT = 'text-sm font-semibold tracking-wide uppercase underline decoration-2 underline-offset-4';
const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? CURRENT : LINK);

// Pages for contributors load when opened, so readers never download the editor.
const AccountPage = lazy(() => import('./components/account/AccountPage'));
const FactionWorkspace = lazy(() => import('./components/editor/FactionWorkspace'));
const RecordEditor = lazy(() => import('./components/editor/RecordEditor'));
// The army sheet the list builder links to.
const PrintPage = lazy(() => import('./components/print/PrintPage'));

/** Page layout and routes. The router and library provider are set up by the client or server entry. */
export default function App() {
  const library = useLibrary();

  const path = useLocation().pathname;
  // Every page but the account page is part of the rulebook itself.
  const inRulebook = !/^\/account\b/.test(path);

  useDocumentTitle(titleForPath(library, path));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 font-sans text-text print:max-w-none print:p-0">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 print:hidden">
        <Link to="/" className="text-3xl font-extrabold tracking-wide uppercase">
          {SITE_NAME}
        </Link>
        {/* The same links, in the same order, as the list builder's. */}
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ConnectionBadge />
          <Link to="/" className={inRulebook ? CURRENT : LINK} aria-current={inRulebook ? 'page' : undefined}>
            Rulebook
          </Link>
          {BUILDER_URL && (
            <a href={BUILDER_URL} className={LINK}>
              List builder
            </a>
          )}
          <NavLink to="/account" className={navClass}>
            Account
          </NavLink>
        </nav>
      </header>
      <Suspense fallback={<p className="text-text/70">Loading…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stratagems" element={<CoreStratagemsPage />} />
          <Route path="/:faction" element={<FactionPage />} />
          <Route path="/:faction/:unit" element={<UnitPage />} />
          <Route path="/:faction/detachment/:detachment" element={<DetachmentPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/print" element={<PrintPage />} />
          {/* The relay list moved into the connection popup. */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
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
        . Datasheets, stratagems and codex rules are sourced from{' '}
        <a href={DATA_SOURCE.url} className="underline">
          {DATA_SOURCE.label}
        </a>{' '}
        and maintained by the community on the relays; none of them are hosted in the code repository. Not official
        Games Workshop material. <SourceStatusLine />
      </footer>
    </main>
  );
}
