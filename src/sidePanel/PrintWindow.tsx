import { Button } from "@kvib/react";
import { useGenerateMapPdf } from "../shared/utils/useGenerateMapPdf";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { mapAtom } from "../map/atoms";
import { useRef } from "react";

export default function PrintWindow() {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { generate, loading } = useGenerateMapPdf();

  return (
    <>
      <Button
        onClick={() => generate(map, overlayRef)}
        disabled={loading}
        colorPalette="green"
      >
        {loading ? t("Loading...") : t("Download PDF")}
      </Button>
      <div ref={overlayRef} />
    </>
  );
}
