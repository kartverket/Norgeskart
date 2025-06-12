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
import { BackgroundLayer } from '../../map/layers';
import { useMapSettings } from '../../map/mapHooks';

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setBackgroundLayer } = useMapSettings();

  const backgroundLayerCollection: { value: BackgroundLayer; label: string }[] =
    [
      {
        value: 'newTopo',
        label: t('map.settings.layers.mapNames.newTopo'),
      },
      {
        value: 'topo',
        label: t('map.settings.layers.mapNames.topo'),
      },
    ];

  return (
    <SelectRoot
      collection={createListCollection({ items: backgroundLayerCollection })}
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
            onClick={() => setBackgroundLayer(item.value)}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
