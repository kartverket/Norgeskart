import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  Stack,
  Text,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { projectionAtom, ProjectionIdentifier } from './map/atoms';

export const Settings = () => {
  //Selec with all the ProjectionIdentifiers
  const [projection, setProjection] = useAtom(projectionAtom);

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
    <>
      <Stack>
        <Text>Projection: {projection}</Text>
        <SelectRoot
          collection={createListCollection({ items: projectionCollection })}
        >
          <SelectTrigger></SelectTrigger>

          <SelectContent>
            {projectionCollection.map((item) => (
              <SelectItem
                key={item.value}
                item={item.value}
                onClick={() =>
                  setProjection(item.value as ProjectionIdentifier)
                }
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Stack>
    </>
  );
};
