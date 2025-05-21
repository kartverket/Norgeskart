import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { projectionIdAtom, ProjectionIdentifier } from '../map/atoms';

export const ProjectionSettings = () => {
  const [projection, setProjection] = useAtom(projectionIdAtom);

  const projectionCollection = [
    'EPSG:3857',
    //'EPSG:25832',
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
        <SelectValueText placeholder={projection} />
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
