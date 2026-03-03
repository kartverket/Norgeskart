import { Button, Group, Heading, HStack, VStack } from '@kvib/react';
import { useState } from 'react';
//import { useTranslation } from 'react-i18next';
import { usePostHog } from '@posthog/react';
import { useSetAtom } from 'jotai';
import { isExportDialogOpenAtom } from '../dialogs/atoms';
import { useDrawSettings } from '../drawControls/hooks/drawSettings';
import {
  handleGeoJsonExport,
  handleGMLExport,
  handleGPXExport,
} from './exportUtils';

const exportFormats = ['GeoJSON', 'GML', 'GPX'] as const;
type ExportFormat = (typeof exportFormats)[number];

export const ExportControls = () => {
  const { getDrawLayer } = useDrawSettings();
  const ph = usePostHog();
  //const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('GeoJSON');
  const setIsExportDialogOpen = useSetAtom(isExportDialogOpenAtom);

  const handleExport = () => {
    const drawLayer = getDrawLayer();
    ph.capture('draw_export', { format: exportFormat });
    switch (exportFormat) {
      case 'GeoJSON':
        handleGeoJsonExport(drawLayer);
        break;
      case 'GML':
        handleGMLExport(drawLayer);
        break;
      case 'GPX':
        handleGPXExport(drawLayer);
        break;
    }
    setIsExportDialogOpen(false);
  };

  return (
    <VStack alignItems="flex-start">
      <Heading size="lg" as="h3" mb="3">
        Velg filformat for eksport av tegning
      </Heading>

      <Group attached>
        {exportFormats.map((format) => {
          const isActive = exportFormat === format;

          return (
            <Button
              key={format}
              size="md"
              onClick={() => setExportFormat(format)}
              variant={isActive ? 'solid' : 'outline'}
              aria-pressed={isActive}
            >
              {format}
            </Button>
          );
        })}
      </Group>

      <HStack mt={8}>
        <Button
          colorPalette="green"
          leftIcon="download"
          size="lg"
          variant="solid"
          onClick={handleExport}
        >
          Last ned ({exportFormat})
        </Button>
      </HStack>
    </VStack>
  );
};
