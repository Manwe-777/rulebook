import type { Toast as ToastData } from '../hooks/useToast';

interface Props {
  toast: ToastData | null;
  onClose: () => void;
}

/** A short message at the bottom of the screen, read out by screen readers, with an optional action. */
export default function Toast({ toast, onClose }: Props) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {toast && (
        <div
          key={toast.key}
          className="pointer-events-auto flex animate-pop items-center gap-3 rounded-lg bg-bar px-4 py-2 text-white shadow-2xl"
        >
          <span className="font-semibold">{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              className="rounded border border-white/40 px-2 text-sm font-bold uppercase hover:bg-white/15"
              onClick={() => {
                toast.action!.run();
                onClose();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
