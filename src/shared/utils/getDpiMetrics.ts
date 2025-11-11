export const getDpiMetrics = () => {
  const dpi = window.devicePixelRatio * 96;
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;

  const a4WidthPx = mmToPx(210);
  const a4HeightPx = mmToPx(305);
  const scaleFactor = Math.min(
    window.innerWidth / a4WidthPx,
    window.innerHeight / a4HeightPx,
    0.8
  );

  const overlayWidth = a4WidthPx * scaleFactor;
  const overlayHeight = a4HeightPx * scaleFactor;

  return { dpi, a4WidthPx, a4HeightPx, overlayWidth, overlayHeight };
};
