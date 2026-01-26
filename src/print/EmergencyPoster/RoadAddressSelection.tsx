import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { EmergencyPosterResponse } from '../../types/searchTypes';

export const RoadAddressSelection = ({
  posterData,
  onSelect,
}: {
  posterData: EmergencyPosterResponse;
  onSelect: (s: string) => void;
}) => {
  return (
    <SelectRoot
      collection={createListCollection({
        items: posterData.vegliste,
      })}
      defaultValue={[posterData.vegliste[0]]}
      onSelect={(s) => {
        onSelect(s.value);
      }}
    >
      <SelectTrigger>
        <SelectValueText />
      </SelectTrigger>
      <SelectContent>
        {posterData.vegliste.map((item, i) => (
          <SelectItem key={item + i} item={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
