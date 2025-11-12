import { toaster } from "@kvib/react";

interface PrintMapProps {
  map: any;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  a4WidthPx: number;
  a4HeightPx: number;
  projection: string;
  setLoading: (value: boolean) => void;
}

export const printMap = async ({
  map,
  overlayRef,
  a4WidthPx,
  a4HeightPx,
  projection,
  setLoading,
}: PrintMapProps) => {
  if (!map || !overlayRef.current) return;
  setLoading(true);

  try {
    map.once("rendercomplete", () => {
      const mapCanvas = map.getViewport().querySelector("canvas") as HTMLCanvasElement | null;
      if (!mapCanvas) {
        toaster.create({ title: "Map canvas not found", type: "error" });
        setLoading(false);
        return;
      }

      const printCanvas = document.createElement("canvas");
      printCanvas.width = a4WidthPx;
      printCanvas.height = a4HeightPx;
      const ctx = printCanvas.getContext("2d");
      if (!ctx) return;

      const overlayRect = overlayRef.current!.getBoundingClientRect();
      const mapRect = mapCanvas.getBoundingClientRect();

      const scaleX = mapCanvas.width / mapRect.width;
      const scaleY = mapCanvas.height / mapRect.height;

      const sx = (overlayRect.left - mapRect.left) * scaleX;
      const sy = (overlayRect.top - mapRect.top) * scaleY;
      const sw = overlayRect.width * scaleX;
      const sh = overlayRect.height * scaleY;

      // Draw map portion
      ctx.drawImage(mapCanvas, sx, sy, sw, sh, 0, 0, printCanvas.width, printCanvas.height - 50);

      // Draw annotations
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";

      const scaleText = document.querySelector(".ol-scale-line-inner")?.textContent || "";
      ctx.textAlign = "center";
      ctx.fillText(scaleText, printCanvas.width / 2, printCanvas.height - 36);

      const center = map.getView().getCenter();
      ctx.textAlign = "left";
      ctx.fillText(`Senterposisjon: ${center?.map((v: number) => v.toFixed(2)).join(", ")}`, 10, printCanvas.height - 24);
      ctx.fillText(`Koordinatsystem: ${projection}`, 10, printCanvas.height - 12);
      ctx.fillText(`Utskriftsdato: ${new Date().toLocaleDateString("no-NO")}`, 10, printCanvas.height);

      // Draw logo
      const logo = new Image();
      logo.src = `${window.location.origin}/logos/KV_logo_staa_color.svg`;
      logo.onload = () => {
        const logoHeight = 35;
        const logoWidth = (logo.width / logo.height) * logoHeight;
        ctx.drawImage(logo, a4WidthPx - logoWidth, a4HeightPx - logoHeight - 1, logoWidth, logoHeight);

        // Open print window
        const imgData = printCanvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank", "width=800,height=1000");
        if (!printWindow) return;

        printWindow.document.body.style.margin = "0";
        printWindow.document.body.style.background = "white";
        const printImg = new Image();
        printImg.src = imgData;
        printImg.style.width = "100%";
        printWindow.document.body.appendChild(printImg);
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    });

    map.renderSync();
  } catch (err) {
    console.error("Print failed:", err);
    toaster.create({ title: "Failed to print map", description: String(err), type: "error" });
  } finally {
    setLoading(false);
  }
};
