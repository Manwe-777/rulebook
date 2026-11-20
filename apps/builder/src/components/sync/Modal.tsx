import { type ReactNode, useEffect, useRef } from 'react';

import { PANEL_TITLE } from '../styles';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A dialog over the page with a title bar; clicking outside it or pressing Escape closes it. */
export default function Modal({ title, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-panel p-0 text-text shadow-2xl backdrop:bg-black/70"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <h2 className={PANEL_TITLE}>{title}</h2>
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </dialog>
  );
}
