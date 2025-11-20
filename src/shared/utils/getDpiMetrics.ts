export type PrintLayout = "A4 Portrait" | "A4 Landscape" | "A3 Portrait" | "A3 Landscape";

export const getDpiMetrics = (layout: string) => {
  const dpi = window.devicePixelRatio * 96; // 96 DPI is standard CSS pixel density
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;

  let mmWidth = 210;
  let mmHeight = 297;

  if (layout === "A4 Landscape") [mmWidth, mmHeight] = [297*0.58, 210*0.58];
  if (layout === "A3 Portrait") [mmWidth, mmHeight] = [297*0.8, 420*0.8]; // Scale down A3 to fit better on screen
  if (layout === "A3 Landscape") [mmWidth, mmHeight] = [420*0.43, 297*0.43]; // Scale down A3 to fit better on screen

  const aWidthPx = mmToPx(mmWidth);
  const aHeightPx = mmToPx(mmHeight);

  const scaleFactor = Math.min(
    window.innerWidth / aWidthPx,
    window.innerHeight / aHeightPx,
    0.8,
  );

  return {
    aWidthPx,
    aHeightPx,
    overlayWidth: aWidthPx * scaleFactor,
    overlayHeight: aHeightPx * scaleFactor,
    layout,
  };
};
