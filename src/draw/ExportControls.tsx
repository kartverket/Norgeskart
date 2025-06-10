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
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { useState } from 'react';
import { downloadStringAsFile } from '../shared/utils/fileOperations';
import { useDrawSettings } from './drawHooks';

const exportFormats = ['GeoJSON', 'SVG'] as const;
type ExportFormat = (typeof exportFormats)[number];
const exportFormatsCollection = exportFormats.map((format) => ({
  value: format,
  label: format,
}));

const handleGeoJsonExport = (layer: VectorLayer) => {
  const writer = new GeoJSON();
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const geojsonStr = writer.writeFeatures(features);
  downloadStringAsFile(
    geojsonStr,
    'Norgeskart_eksport.geojson',
    'application/json',
  );
};

export const ExportControls = () => {
  const { getDrawLayer } = useDrawSettings();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('GeoJSON');

  const handleExport = () => {
    const drawLayer = getDrawLayer();
    switch (exportFormat) {
      case 'GeoJSON':
        handleGeoJsonExport(drawLayer);
        break;
      case 'SVG':
        // Handle SVG export logic here
        break;
      default:
        console.error('Unsupported export format:', exportFormat);
        return;
    }
  };
  return (
    <VStack alignItems="flex-start" w={'100%'}>
      <Heading size={'lg'} as="h3">
        Eksport av tegning
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
        >
          <SelectLabel>Tegneverktøy:</SelectLabel>
          <SelectTrigger>
            <SelectValueText placeholder={'Velg tegneform'} />
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
        <Button onClick={handleExport}>Last ned</Button>
      </HStack>
    </VStack>
  );
};
