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
import { validateBackgroundLayerIdString } from '../../shared/utils/enumUtils';
import { getUrlParameter } from '../../shared/utils/urlUtils';

export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setBackgroundLayer } = useMapSettings();

  const backgroundLayerCollection: { value: BackgroundLayer; label: string }[] =
    [
      {
        value: 'topo',
        label: t('map.settings.layers.mapNames.topo'),
      },
      {
        value: 'topoGrayscale',
        label: t('map.settings.layers.mapNames.topoGrayscale'),
      },
      {
        value: 'topo_2025',
        label: t('map.settings.layers.mapNames.topo_2025'),
      },
    ];

  const backgrundLayerId = validateBackgroundLayerIdString(
    getUrlParameter('backgroundLayer'),
  );
  const defaultBackgroundLayer = backgrundLayerId
    ? backgrundLayerId
    : 'topo'; // Default to 'topo' if no valid background layer is found

  return (
    <SelectRoot
      collection={createListCollection({ items: backgroundLayerCollection })}
      defaultValue={[defaultBackgroundLayer]}
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
