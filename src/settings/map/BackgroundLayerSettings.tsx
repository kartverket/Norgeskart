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
  WMTSLayerID,
  WMTSLayerName,
  WMTSProviderId,
} from '../../map/layers/backgroundProviders';
import { useMapSettings } from '../../map/mapHooks';

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setWMTSBackgroundLayer } = useMapSettings();

  const backgroundLayerCollection: { value: WMTSLayerID; label: string }[] = [
    {
      value: 'kartverketCache_topo',
      label: t('map.settings.layers.mapNames.topo'),
    },
    {
      value: 'kartverketCache_topograatone',
      label: t('map.settings.layers.mapNames.topoGrayscale'),
    },
    {
      value: 'kartverketATKV3dev_topo',
      label: t('map.settings.layers.mapNames.topo_2025'),
    },
    {
      value: 'kartverketCache_sjokartraster',
      label: t('map.settings.layers.mapNames.seamap'),
    },
  ];

  //TODO: Fix url parameter handling

  return (
    <SelectRoot
      collection={createListCollection({ items: backgroundLayerCollection })}
      defaultValue={['kartverketCache_topo']}
    >
      <SelectLabel>{t('map.settings.layers.background.label')}</SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('map.settings.layers.background.placeholder')}
        />
      </SelectTrigger>
      <SelectContent>
        {backgroundLayerCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => {
              const [WTMSProvider, layerName] = item.value.split('_');
              setWMTSBackgroundLayer(
                WTMSProvider as WMTSProviderId,
                layerName as WMTSLayerName,
              );
            }}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
