import {
  Button,
  createListCollection,
  Heading,
  HStack,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawSettings } from '../drawControls/hooks/drawSettings';
import {
  handleGeoJsonExport,
  handleGMLExport,
  handleGPXExport,
} from './exportUtils';

const exportFormats = ['GeoJSON', 'GML', 'GPX'] as const;
type ExportFormat = (typeof exportFormats)[number];
const exportFormatsCollection = exportFormats.map((format) => ({
  value: format,
  label: format,
}));

export const ExportControls = () => {
  const { getDrawLayer } = useDrawSettings();
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('GeoJSON');

  const handleExport = () => {
    const drawLayer = getDrawLayer();
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
      default:
        console.error('Unsupported export format:', exportFormat);
        return;
    }
  };
  return (
    <VStack alignItems="flex-start" w={'200px'}>
      <Heading size={'md'} as="h3">
        {t('export.heading')}
      </Heading>

      <HStack
        w={'100%'}
        justifyContent={'space-between'}
        alignItems={'flex-end'}
      >
        <SelectRoot
          collection={createListCollection({
            items: exportFormatsCollection,
          })}
          value={[exportFormat]}
          size="sm"
        >
          <SelectLabel>{t('export.format.label')}:</SelectLabel>
          <SelectTrigger>
            <SelectValueText placeholder={t('export.format.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {exportFormatsCollection.map((item) => (
              <SelectItem
                key={item.value}
                item={item.value}
                onClick={() => setExportFormat(item.value as ExportFormat)}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </HStack>
      <Button size="sm" onClick={handleExport}>
        {t('shared.actions.download')}
      </Button>
    </VStack>
  );
};
