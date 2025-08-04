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
import {
  loadableWMTS,
  WMTSLayerName,
  WMTSProviderId,
} from '../../map/layers/backgroundProviders';
import { useMapSettings } from '../../map/mapHooks';

const layerPriorityMap = new Map<WMTSLayerName, number>([
  ['topo', 1],
  ['topoProd', 1],
  ['topograatone', 2],
  ['sjokartraster', 3],
  ['Nibcache_web_mercator_v2', 6],
  ['Nibcache_UTM32_EUREF89_v2', 7],
  ['Nibcache_UTM33_EUREF89_v2', 8],
  ['Nibcache_UTM35_EUREF89_v2', 8],
]);

const layerPrioritySort = (
  a: { value: [WMTSProviderId, WMTSLayerName]; label: string },
  b: { value: [WMTSProviderId, WMTSLayerName]; label: string },
) => {
  const priorityA = layerPriorityMap.get(a.value[1]) || 0;
  const priorityB = layerPriorityMap.get(b.value[1]) || 0;

  return priorityA - priorityB;
};

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setWMTSBackgroundLayer, getMapProjectionCode } = useMapSettings();
  const WMTSProviders = useAtomValue(loadableWMTS);

  if (WMTSProviders.state !== 'hasData') {
    return null;
  }

  const projectionCode = getMapProjectionCode();
  const providers = WMTSProviders.data.keys();

  const avaiableLayers: {
    value: [WMTSProviderId, WMTSLayerName];
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
        value: [providerId, layerName] as [WMTSProviderId, WMTSLayerName],
        label: t(`map.settings.layers.mapNames.${layerName}`),
      };
    });

    avaiableLayers.push(...avaialbeLayersForPriovider);
  }

  //TODO: Fix url parameter handling
  const listCollection = createListCollection({
    items: avaiableLayers.sort(layerPrioritySort),
  });

  return (
    <SelectRoot
      collection={listCollection}
      defaultValue={['kartverketCache_topo']}
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
            key={item.value[0] + '-' + item.value[1]}
            item={item}
            onClick={() => {
              setWMTSBackgroundLayer(item.value[0], item.value[1]);
            }}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
