import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  HStack,
  Heading,
  Text,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { TileWMS } from 'ol/source';
import type VectorSource from 'ol/source/Vector';
import { useTranslation } from 'react-i18next';
import { urlGeoJsonLayersAtom } from '../layers/urlGeoJson';
import { urlWmsLayersAtom } from '../layers/urlWms';
import { DekningsstatusLegend } from './DekningsstatusLegend';

const WmsLegendItem = ({ layer }: { layer: TileLayer }) => {
  const title = (layer.get('layerTitle') as string | undefined) ?? '';
  const source = layer.getSource() as TileWMS | null;
  const baseUrl = source?.getUrls()?.[0];
  const params = source?.getParams() as { LAYERS?: string } | undefined;
  const legendUrl =
    baseUrl && params?.LAYERS
      ? `${baseUrl}?SERVICE=WMS&REQUEST=GetLegendGraphic&VERSION=1.3.0&SLD_VERSION=1.1.0&FORMAT=image%2Fpng&LAYER=${encodeURIComponent(params.LAYERS)}`
      : null;

  return (
    <AccordionItem value={layer.get('id') as string}>
      <AccordionItemTrigger>
        <Heading size="sm">{title}</Heading>
      </AccordionItemTrigger>
      <AccordionItemContent>
        {legendUrl ? (
          <img
            src={legendUrl}
            alt={`Legend for ${title}`}
            style={{ maxWidth: '100%' }}
          />
        ) : (
          <Text fontSize="sm">–</Text>
        )}
      </AccordionItemContent>
    </AccordionItem>
  );
};

const GeoJsonLegendItem = ({
  layer,
}: {
  layer: VectorLayer<VectorSource<Feature<Geometry>>>;
}) => {
  const { t } = useTranslation();
  const title = (layer.get('layerTitle') as string | undefined) ?? '';
  const isDekningsstatus = layer.get('styleType') === 'dekningsstatus';

  return (
    <AccordionItem value={layer.get('id') as string}>
      <AccordionItemTrigger>
        <Heading size="sm">{title}</Heading>
      </AccordionItemTrigger>
      <AccordionItemContent>
        {isDekningsstatus ? (
          <DekningsstatusLegend />
        ) : (
          <HStack gap={2} alignItems="center">
            <Box
              w={4}
              h={4}
              bg="rgba(51,153,204,0.2)"
              border="2px solid"
              borderColor="#3399cc"
              flexShrink={0}
            />
            <Text fontSize="sm">{t('legend.item.fallbackMessage')}</Text>
          </HStack>
        )}
      </AccordionItemContent>
    </AccordionItem>
  );
};

export const UrlLayersLegend = () => {
  const wmsLayers = useAtomValue(urlWmsLayersAtom);
  const geoJsonLayers = useAtomValue(urlGeoJsonLayersAtom);

  if (wmsLayers.length === 0 && geoJsonLayers.length === 0) return null;

  return (
    <>
      {wmsLayers.map((layer) => (
        <WmsLegendItem key={layer.get('id') as string} layer={layer} />
      ))}
      {geoJsonLayers.map((layer) => (
        <GeoJsonLegendItem key={layer.get('id') as string} layer={layer} />
      ))}
    </>
  );
};
