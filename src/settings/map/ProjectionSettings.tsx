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
import { ProjectionIdentifier } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();
  const { t } = useTranslation();

  const projectionCollection = [
    'EPSG:3857',
    'EPSG:25832',
    'EPSG:25833',
    'EPSG:25835',
  ].map((projection) => ({
    value: projection,
    label: projection,
  }));

  return (
    <SelectRoot
      collection={createListCollection({ items: projectionCollection })}
    >
      <SelectLabel>{t('map.settings.layers.projection.label')}</SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('map.settings.layers.projection.placeholder')}
        />
      </SelectTrigger>
      <SelectContent>
        {projectionCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => setProjection(item.value as ProjectionIdentifier)}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
