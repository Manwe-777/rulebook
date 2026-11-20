import { type ReactNode, useEffect, useRef } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A parchment dialog over the page with a title bar; clicking outside it, Escape or the close button closes it. */
export default function Modal({ title, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100vw-2rem))] overflow-y-auto rounded-xl bg-parchment p-0 font-sans text-ink shadow-2xl backdrop:bg-black/70"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <div className="flex items-center justify-between bg-bar px-4 py-2 text-white">
        <h2 className="text-xl font-extrabold tracking-wide uppercase">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          className="rounded px-2 text-xl font-bold hover:bg-bar-dark"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </dialog>
  );
}
