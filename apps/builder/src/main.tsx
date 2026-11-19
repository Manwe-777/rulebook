/* The icon font's CSS only declares the font and its glyph classes, so it needs no layer. */
import '@nanoseeds/wh40k-icon/dist/warhammer40k.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
