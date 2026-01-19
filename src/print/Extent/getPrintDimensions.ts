export type PrintLayout =
  | 'A4 Portrait'
  | 'A4 Landscape'
  | 'A3 Portrait'
  | 'A3 Landscape';

const layoutSizes = {
  'A4 Portrait': { width: 210, height: 297 },
  'A4 Landscape': { width: 297, height: 210 },
  'A3 Portrait': { width: 297, height: 420 },
  'A3 Landscape': { width: 420, height: 297 },
};

export const getPrintDimensions = (layout: PrintLayout, printDpi = 128) => {
  const size = layoutSizes[layout] || layoutSizes['A4 Portrait'];
  const mmToPx = (mm: number, dpi: number) => (mm / 25.4) * dpi;
  const printWidthPx = mmToPx(size.width, printDpi);
  const printHeightPx = mmToPx(size.height, printDpi);

  const maxW = window.innerWidth * 0.8;
  const maxH = window.innerHeight * 0.8;
  const scale = Math.min(maxW / printWidthPx, maxH / printHeightPx, 1);
  return {
    printWidthPx,
    printHeightPx,
    overlayWidthPx: printWidthPx * scale,
    overlayHeightPx: printHeightPx * scale,
    scale,
    printDpi,
    mmWidth: size.width,
    mmHeight: size.height,
  };
};
