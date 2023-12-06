export default function download(file: Blob, name: string) {
  const href = window.URL.createObjectURL(new Blob([file]));

  const anchorElement = document.createElement('a');

  anchorElement.href = href;
  anchorElement.download = name;

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
}