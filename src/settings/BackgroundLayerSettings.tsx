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
import { backgroundLayerAtom } from '../map/atoms';
import { BackgroundLayer } from '../map/layers';

export const BackgroundLayerSettings = () => {
  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);

  const backgroundLayerCollection: { value: BackgroundLayer; label: string }[] =
    [
      {
        value: 'newTopo',
        label: 'Nye topografiske kart',
      },
      {
        value: 'topo',
        label: 'Topografiske kart',
      },
    ];

  return (
    <SelectRoot
      collection={createListCollection({ items: backgroundLayerCollection })}
    >
      <SelectLabel>Velg projeksjon</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={backgroundLayer} />
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
