import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { WMSLayerName } from '../../map/layers/backgroundWMS';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
} from '../../map/layers/backgroundWMTSProviders';
import { useMapSettings } from '../../map/mapHooks';
import { getUrlParameter } from '../../shared/utils/urlUtils';

const layerPriorityMap = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['topograatone', 2],
  ['toporaster', 3],
  ['sjokartraster', 4],
  ['oceanicelectronic', 5],
  ['Nibcache_web_mercator_v2', 6],
  ['Nibcache_UTM32_EUREF89_v2', 7],
  ['Nibcache_UTM33_EUREF89_v2', 8],
  ['Nibcache_UTM35_EUREF89_v2', 8],
]);

const layerPrioritySort = (
  a: {
    value: BackgroundLayerName;
    label: string;
  },
  b: {
    value: BackgroundLayerName;
    label: string;
  },
) => {
  const priorityA = layerPriorityMap.get(a.value) || 0;
  const priorityB = layerPriorityMap.get(b.value) || 0;

  return priorityA - priorityB;
};

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setBackgroundLayer, getMapProjectionCode } = useMapSettings();
  const WMTSProviders = useAtomValue(loadableWMTS);

  if (WMTSProviders.state !== 'hasData') {
    return null;
  }

  const projectionCode = getMapProjectionCode();
  const providers = WMTSProviders.data.keys();

  const avaiableLayers: {
    value: BackgroundLayerName;
    label: string;
  }[] = [];

  for (const providerId of providers) {
    const projectionLayersIterator = WMTSProviders.data
      .get(providerId)
      ?.get(projectionCode)
      ?.keys();
    const projectionLayerNames = Array.from(projectionLayersIterator || []);

    const avaialbeLayersForPriovider = projectionLayerNames.map((layerName) => {
      return {
        value: layerName,
        label: t(`map.settings.layers.mapNames.${layerName}`),
      };
    });

    avaiableLayers.push(...avaialbeLayersForPriovider);
  }

  avaiableLayers.push({
    value: 'oceanicelectronic' as WMSLayerName,
    label: t(`map.settings.layers.mapNames.oceanicelectronic`),
  });

  const listCollection = createListCollection({
    items: avaiableLayers.sort(layerPrioritySort),
  });
  const layerFromUrl = getUrlParameter('backgroundLayer');

  return (
    <SelectRoot
      collection={listCollection}
      defaultValue={layerFromUrl ? [layerFromUrl] : [DEFAULT_BACKGROUND_LAYER]}
    >
      <SelectLabel>{t('map.settings.layers.background.label')}</SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('map.settings.layers.background.placeholder')}
        />
      </SelectTrigger>
      <SelectContent>
        {listCollection.items.map((item) => (
          <SelectItem
            key={item.value}
            item={item}
            onClick={() => {
              setBackgroundLayer(item.value);
            }}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
