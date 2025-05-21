import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { ProjectionIdentifier } from '../map/atoms';
import { useMapSettings } from '../map/mapHooks';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();

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
      <SelectLabel>Velg projeksjon</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={'Velg en projeksjon da vel'} />
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
