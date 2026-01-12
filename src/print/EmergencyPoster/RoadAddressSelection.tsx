import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Spinner,
  Text,
} from '@kvib/react';
import { UseQueryResult } from '@tanstack/react-query';
import { EmergencyPosterResponse } from '../../types/searchTypes';

export const RoadAddressSelection = ({
  posterData,
  onSelect,
}: {
  posterData: UseQueryResult<EmergencyPosterResponse | null, Error>;
  onSelect: (s: string) => void;
}) => {
  if (posterData.isLoading) {
    return <Spinner />;
  }
  if (posterData.error) {
    return <Text>Error</Text>;
  }

  if (posterData.data == null) {
    return null;
  }
  return (
    <SelectRoot
      collection={createListCollection({
        items: posterData.data.vegliste,
      })}
      defaultValue={[posterData.data.vegliste[0]]}
      onSelect={(s) => {
        onSelect(s.value);
      }}
    >
      <SelectTrigger>
        <SelectValueText />
      </SelectTrigger>
      <SelectContent>
        {posterData.data.vegliste.map((item) => (
          <SelectItem key={item} item={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
