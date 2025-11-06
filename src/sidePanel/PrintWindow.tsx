import { Box, Button, Flex, Heading, Text, Spinner, toaster } from "@kvib/react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { mapAtom } from "../map/atoms";
import { useState, useRef, useEffect } from "react";

interface PrintWindowProps {
  onClose: () => void;
}

// ---------------------------- DPI Utility ----------------------------
export function getDpiMetrics() {
  const dpi = window.devicePixelRatio * 96;
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;
  const a4WidthPx = mmToPx(210);
  const a4HeightPx = mmToPx(305); // 297 + small buffer
  const scaleFactor = Math.min(window.innerWidth / a4WidthPx, window.innerHeight / a4HeightPx, 0.8);
  const overlayWidth = a4WidthPx * scaleFactor;
  const overlayHeight = a4HeightPx * scaleFactor;
  return { dpi, a4WidthPx, a4HeightPx, overlayWidth, overlayHeight };
}

// ---------------------------- PrintWindow Component ----------------------------
const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { a4WidthPx, a4HeightPx, overlayWidth, overlayHeight } = getDpiMetrics();
  const [overlayPosition, setOverlayPosition] = useState({ x: 100, y: 100 });
  const projection = map?.getView().getProjection().getCode();

  // Center overlay on load
  useEffect(() => {
    if (!map) return;
    const rect = map.getViewport().getBoundingClientRect();
    setOverlayPosition({
      x: rect.width / 2 - overlayWidth / 2,
      y: rect.height / 2 - overlayHeight / 2,
    });
  }, [map, overlayWidth, overlayHeight]);

  // Attach overlay
  useEffect(() => {
    if (!map || !overlayRef.current) return;
    const overlay = overlayRef.current;
    const mapContainer = map.getViewport();

    mapContainer.querySelectorAll(".print-overlay").forEach((el) => el.remove());
    overlay.classList.add("print-overlay");
    Object.assign(overlay.style, {
      position: "absolute",
      top: `${overlayPosition.y}px`,
      left: `${overlayPosition.x}px`,
      width: `${overlayWidth}px`,
      height: `${overlayHeight}px`,
      border: "2px dashed blue",
      cursor: "move",
      zIndex: "1000",
      background: "rgba(0,0,255,0.05)",
    });
    mapContainer.appendChild(overlay);

    return () => overlay.remove();
  }, [map, overlayPosition, overlayWidth, overlayHeight]);

  // Enable dragging of overlay
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !map) return;

    let offsetX = 0,
      offsetY = 0,
      isDragging = false;
    const interactions = map.getInteractions();

    const toggleDragPan = (enable: boolean) => {
      interactions.forEach((i) => {
        if (i.constructor.name.includes("DragPan")) i.setActive(enable);
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - overlay.offsetLeft;
      offsetY = e.clientY - overlay.offsetTop;
      toggleDragPan(false);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const rect = map.getViewport().getBoundingClientRect();
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      x = Math.max(0, Math.min(x, rect.width - overlayWidth));
      y = Math.max(0, Math.min(y, rect.height - overlayHeight));
      setOverlayPosition({ x, y });
    };

    const onMouseUp = () => {
      if (isDragging) toggleDragPan(true);
      isDragging = false;
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [map, overlayWidth, overlayHeight]);

  // ---------------------------- Quick Print ----------------------------
  const printMap = async () => {
    if (!map) return;
    setLoading(true);

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
      if (!ctx || !overlayRef.current) return;

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const mapRect = mapCanvas.getBoundingClientRect();
      const scaleX = mapCanvas.width / mapRect.width;
      const scaleY = mapCanvas.height / mapRect.height;
      const sx = (overlayRect.left - mapRect.left) * scaleX;
      const sy = (overlayRect.top - mapRect.top) * scaleY;
      const sw = overlayRect.width * scaleX;
      const sh = overlayRect.height * scaleY;

      ctx.drawImage(mapCanvas, sx, sy, sw, sh, 0, 0, printCanvas.width, printCanvas.height - 42);

      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      const scaleText = document.querySelector(".ol-scale-line-inner")?.textContent || "";
      ctx.textAlign = "center";
      ctx.fillText(scaleText, printCanvas.width / 2, a4HeightPx - 24);

      const lonLat = map.getView().getCenter();
      ctx.textAlign = "left";
      ctx.fillText(`Senterposisjon: ${lonLat?.map((v) => v.toFixed(2)).join(", ")}`, 0, a4HeightPx - 24);
      ctx.fillText(`Koordinatsystem: ${projection}`, 0, a4HeightPx - 12);
      ctx.fillText(`Utskriftsdato: ${new Date().toLocaleDateString("no-NO")}`, 0, a4HeightPx);

      const logo = new Image();
      logo.src = `${window.location.origin}/logos/KV_logo_staa_color.svg`;
      logo.onload = () => {
        const logoHeight = 35;
        const logoWidth = (logo.width / logo.height) * logoHeight;
        ctx.drawImage(logo, a4WidthPx - logoWidth, a4HeightPx - logoHeight - 1, logoWidth, logoHeight);
        const img = printCanvas.toDataURL("image/png");

        const printWindow = window.open("", "_blank", "width=800,height=1000");
        if (!printWindow) return;
        printWindow.document.body.style.margin = "0";
        printWindow.document.body.style.background = "white";
        const printImg = new Image();
        printImg.src = img;
        printImg.style.width = "100%";
        printWindow.document.body.appendChild(printImg);
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      setLoading(false);
    });

    map.renderSync();
  };

  // ---------------------------- Generate Map PDF ----------------------------
  const generateMapPdf = async () => {
    if (!map || !overlayRef.current) return;

    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();
    const centerX = overlayRect.left - mapRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top - mapRect.top + overlayRect.height / 2;
    const [lon, lat] = map.getCoordinateFromPixel([centerX, centerY]);
    const pos = `${lon.toFixed(2)}, ${lat.toFixed(2)}`;

    const payload = {
      attributes: {
        map: {
          center: [lon, lat],
          projection,
          dpi: 128,
          layers: [
            {
              baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
              customParams: {
                TRANSPARENT: "true",
                CQL_FILTER: "BYGNINGSTATUS<9 OR BYGNINGSTATUS=13"
              },
              imageFormat: "image/png",
              layers: ["matrikkel:BYGNINGWFS"],
              opacity: 1,
              type: "WMS"
            },
            {
              baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
              customParams: {
                TRANSPARENT: "true"
              },
              imageFormat: "image/png",
              layers: ["matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS"],
              opacity: 1,
              type: "WMS"
            },
            {
              baseURL: "https://cache.kartverket.no/v1/service",
              customParams: {
                TRANSPARENT: "true"
              },
              style: "default",
              imageFormat: "image/png",
              layer: "topo",
              opacity: 1,
              type: "WMTS",
              dimensions: null,
              requestEncoding: "KVP",
              dimensionParams: {},
              matrixSet: "utm33n",
              matrices: [
                { identifier: "0", scaleDenominator: 77371428.57142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1, 1] },
                { identifier: "1", scaleDenominator: 38685714.28571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2, 2] },
                { identifier: "2", scaleDenominator: 19342857.142857146, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4, 4] },
                { identifier: "3", scaleDenominator: 9671428.571428573, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8, 8] },
                { identifier: "4", scaleDenominator: 4835714.285714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16, 16] },
                { identifier: "5", scaleDenominator: 2417857.142857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32, 32] },
                { identifier: "6", scaleDenominator: 1208928.5714285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [64, 64] },
                { identifier: "7", scaleDenominator: 604464.2857142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [128, 128] },
                { identifier: "8", scaleDenominator: 302232.1428571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [256, 256] },
                { identifier: "9", scaleDenominator: 151116.07142857145, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [512, 512] },
                { identifier: "10", scaleDenominator: 75558.03571428572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1024, 1024] },
                { identifier: "11", scaleDenominator: 37779.01785714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2048, 2048] },
                { identifier: "12", scaleDenominator: 18889.50892857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4096, 4096] },
                { identifier: "13", scaleDenominator: 9444.754464285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8192, 8192] },
                { identifier: "14", scaleDenominator: 4722.377232142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16384, 16384] },
                { identifier: "15", scaleDenominator: 2361.188616071429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32768, 32768] },
                { identifier: "16", scaleDenominator: 1180.5943080357144, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [65536, 65536] },
                { identifier: "17", scaleDenominator: 590.2971540178572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [131072, 131072] },
                { identifier: "18", scaleDenominator: 295.1485770089286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [262144, 262144] }
              ]
            }
          ],
          scale: 10000,
          rotation: 0,
        },
        pos,
        scale_string: "1:25000",
        title: "",
      },
      layout: "1_A4_portrait",
      outputFormat: "pdf",
      outputFilename: "norgeskart-utskrift",
    };

    setLoading(true);

    try {
      const res = await fetch("https://ws.geonorge.no/print/kv/report.pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const result = await res.json();
      if (!result.statusURL) throw new Error("No status URL returned");

      const MAX_RETRIES = 5;
      let attempt = 0;

      const pollStatus = async () => {
        try {
          const statusRes = await fetch(`https://ws.geonorge.no${result.statusURL}`);
          if (!statusRes.ok) throw new Error(`Status check failed: ${statusRes.status}`);

          const status = await statusRes.json();

          if (status.done && status.status === "finished") {
            window.open(`https://ws.geonorge.no${status.downloadURL}`, "_blank");
            setLoading(false);
          } else {
            attempt++;
            if (attempt < MAX_RETRIES) {
              setTimeout(pollStatus, 2000);
            } else {
              setLoading(false);
              toaster.create({
                title: t("Failed to generate PDF."),
                description: t("PDF generation timed out after multiple attempts."),
                type: "error",
                duration: 4000,
              });
            }
          }
        } catch (err: any) {
          setLoading(false);
          console.error("Error polling PDF status:", err);
          toaster.create({
            title: t("Failed to generate PDF."),
            description: err.message || String(err),
            type: "error",
            duration: 4000,
          });
        }
      };


      pollStatus();
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toaster.create({
        title: t("Failed to generate PDF.") || "Failed to generate PDF",
        description: err.message || String(err),
        type: "error",
        duration: 4000,
      });
    }
    finally {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
    }
  };

  // ---------------------------- Close ----------------------------
  const handleClose = () => {
    setLoading(false);
    overlayRef.current?.remove();
    onClose();
  };

  return (
    <Box
      position="absolute"
      top="50%"
      left={{ base: "50%", md: "0px" }}
      transform="translateY(-50%)"
      background="white"
      border="1px solid #ddd"
      borderRadius="8px"
      boxShadow="0 2px 10px rgba(0,0,0,0.15)"
      p={6}
      zIndex={1001}
      width={{ base: "100%", md: "400px" }}
    >
      <Heading as="h3" size="md" mb={3}>
        {t("Print map")}
      </Heading>

      <Text fontSize="sm" mb={4}>
        {t("Drag the A4 box over the map to select the area to print.")}
      </Text>

      {loading && (
        <Flex justifyContent="center" alignItems="center" mb={3} gap={2}>
          <Spinner />
          <Text>{t("Loading map tiles...")}</Text>
        </Flex>
      )}

      <Flex justifyContent="flex-end" gap={3}>
        <Button onClick={handleClose} variant="ghost" colorPalette="gray" disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button onClick={printMap} colorPalette="green" disabled={loading}>
          {t("Quick Print")}
        </Button>
        <Button onClick={generateMapPdf} colorPalette="green" disabled={loading}>
          {t("Download PDF")}
        </Button>
      </Flex>

      <div ref={overlayRef} />
    </Box>
  );
};

export default PrintWindow;
