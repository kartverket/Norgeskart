import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import {
  WMTSLayerName,
  WMTSProviderId,
} from '../../map/layers/backgroundProviders';
import { useMapSettings } from '../../map/mapHooks';

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setWMTSBackgroundLayer } = useMapSettings();

  const backgroundLayerCollection: {
    value: [WMTSProviderId, WMTSLayerName];
    label: string;
  }[] = [
    {
      value: ['kartverketCache', 'topo'],
      label: t('map.settings.layers.mapNames.topo'),
    },
    {
      value: ['kartverketCache', 'topograatone'],
      label: t('map.settings.layers.mapNames.topoGrayscale'),
    },
    {
      value: ['kartverketATKV3dev', 'topo'],
      label: t('map.settings.layers.mapNames.topo_2025'),
    },
    {
      value: ['kartverketCache', 'sjokartraster'],
      label: t('map.settings.layers.mapNames.seamap'),
    },
    {
      value: ['norgeibilder_webmercator', 'Nibcache_web_mercator_v2'],
      label: t('map.settings.layers.mapNames.orthophoto'),
    },
  ];

  //TODO: Fix url parameter handling
  const listCollection = createListCollection({
    items: backgroundLayerCollection,
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
