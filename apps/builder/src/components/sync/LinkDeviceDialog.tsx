import { useEffect, useState } from 'react';

import { formatLinkCode } from '../../utils/formatLinkCode';
import { BUTTON_QUIET } from '../styles';
import Modal from './Modal';
import QrCode from './QrCode';

interface Props {
  makeLink: () => Promise<{ code: string; url: string } | null>;
  onClose: () => void;
}

/** Shows the QR code and short code another device uses to get this device's key, with the steps in plain words. */
export default function LinkDeviceDialog({ makeLink, onClose }: Props) {
  const [link, setLink] = useState<{ code: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let open = true;

    void makeLink().then((made) => open && setLink(made));

    return () => {
      open = false;
    };
    // A new link (and code) each time the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = () => {
    if (!link) return;

    void navigator.clipboard?.writeText(link.url).then(() => setCopied(true));
  };

  return (
    <Modal title="Link a phone or another device" onClose={onClose}>
      {!link ? (
        <p className="text-text/70">Preparing the link…</p>
      ) : (
        <>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
            <li>On the other device, open the camera and point it at this code.</li>
            <li>Open the link it shows. The list builder opens there.</li>
            <li>Type this code there:</li>
          </ol>
          <p className="text-center font-mono text-3xl font-bold tracking-widest">{formatLinkCode(link.code)}</p>
          <QrCode text={link.url} label="QR code that opens the link on the other device" />
          <p className="text-xs text-text/70">
            No camera? Copy the link, send it to yourself and open it on the other device, then type the code.
          </p>
          <button type="button" className={`${BUTTON_QUIET} self-start text-sm`} onClick={copy}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <p className="text-xs text-text/70">
            Keep the code to yourself: together with the QR it gives access to your lists. A new code is made each time
            you open this.
          </p>
        </>
      )}
    </Modal>
  );
}
