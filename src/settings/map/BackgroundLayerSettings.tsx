import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { BackgroundLayer } from '../../map/layers';
import { useMapSettings } from '../../map/mapHooks';

export const BackgroundLayerSettings = () => {
  const { setBackgroundLayer } = useMapSettings();

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
        <SelectValueText placeholder={'Velg bakgrunnskart'} />
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
