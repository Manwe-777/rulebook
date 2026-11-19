/** Makes the browser save a text as a file. */
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });

  link.click();
  URL.revokeObjectURL(url);
}
