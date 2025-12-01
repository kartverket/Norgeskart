import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateMapPdf } from '../utils/generateMapPdf';

export const useGenerateMapPdf = (currentLayout: string) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const generate = useCallback(
    async (map: any, overlayRef: React.RefObject<HTMLDivElement | null>) => {
      if (!map || !overlayRef.current) return;

      setLoading(true);

      try {
        await generateMapPdf({ map, overlayRef, setLoading, t, currentLayout });
      } catch (err: any) {
        console.error('Error generating PDF:', err);
      } finally {
        setLoading(false);
      }
    },
    [t, currentLayout],
  );

  return { generate, loading };
};
