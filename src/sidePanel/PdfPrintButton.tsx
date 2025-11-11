import { useTranslation } from "react-i18next";
import { useGenerateMapPdf } from "../shared/utils/useGenerateMapPdf";

interface PdfPrintButtonProps {
  map: any;
  overlayRef: React.RefObject<HTMLDivElement | null>;
}

export const PdfPrintButton = ({ map, overlayRef }: PdfPrintButtonProps) => {
  const {t} = useTranslation();
  const { generate, loading } = useGenerateMapPdf();

  return (
    <button disabled={loading} onClick={() => generate(map, overlayRef)}>
      {loading ? t("Generating...") : t("Download PDF")}
    </button>
  );
};
