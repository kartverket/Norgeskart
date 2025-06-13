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
import { GeoJSON, GML } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadStringAsFile } from '../shared/utils/fileOperations';
import { useDrawSettings } from './drawHooks';

const exportFormats = ['GeoJSON', 'GML'] as const;
type ExportFormat = (typeof exportFormats)[number];
const exportFormatsCollection = exportFormats.map((format) => ({
  value: format,
  label: format,
}));

const handleGeoJsonExport = (layer: VectorLayer) => {
  const formater = new GeoJSON();
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const geojsonStr = formater.writeFeatures(features);
  downloadStringAsFile(
    geojsonStr,
    'Norgeskart_eksport.geojson',
    'application/json',
  );
};

const handleGmlExport = (layer: VectorLayer) => {
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  // Use a default feature type and geometry name
  const formater = new GML({
    featureNS: 'http://www.opengis.net/gml',
    featureType: 'feature',
    srsName: layer.getSource()?.getProjection()?.getCode() || 'EPSG:4326',
  });

  // Ensure all features have the correct geometry name
  features.forEach((f) => {
    if (f.getGeometryName() !== 'geometry') {
      f.setGeometryName('geometry');
    }
  });

  const gmlStr = formater.writeFeatures(features);
  downloadStringAsFile(gmlStr, 'Norgeskart_eksport.gml', 'application/gml+xml');
};

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
        handleGmlExport(drawLayer);
        break;
      default:
        console.error('Unsupported export format:', exportFormat);
        return;
    }
  };
  return (
    <VStack alignItems="flex-start" w={'100%'}>
      <Heading size={'lg'} as="h3">
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
        <Button onClick={handleExport}>{t('shared.actions.download')}</Button>
      </HStack>
    </VStack>
  );
};
