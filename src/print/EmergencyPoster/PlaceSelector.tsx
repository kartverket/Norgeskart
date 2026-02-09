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
import { useQuery } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { mapAtom, ProjectionIdentifier } from '../../map/atoms';
import { getPlaceNamesByLocation } from '../../search/searchApi';
import { Place } from '../../types/searchTypes';

export const PlaceSelector = ({
  coordinates,
  range,
  onSelect,
  onLoadComplete,
}: {
  coordinates: Coordinate | null;
  range: number;
  onSelect: (s: string) => void;
  onLoadComplete: (s: string) => void;
}) => {
  const placesNearby = useQuery({
    queryKey: ['places', coordinates],
    queryFn: async () => {
      if (!coordinates) {
        return null;
      }
      const projectionCode = getDefaultStore()
        .get(mapAtom)
        .getView()
        .getProjection()
        .getCode() as ProjectionIdentifier;
      const response = await getPlaceNamesByLocation(
        coordinates[0],
        coordinates[1],
        range,
        projectionCode,
      );

      if (!response.navn) {
        return [];
      }
      const places = response.navn.map(Place.fromPlaceNamePoint);
      onLoadComplete(places[0]?.name || '');
      return places;
    },
  });

  if (placesNearby.isLoading) {
    return <Spinner />;
  }
  if (placesNearby.error) {
    return <Text>Error</Text>;
  }

  if (placesNearby.data == null) {
    return null;
  }

  return (
    <SelectRoot
      collection={createListCollection({
        items: placesNearby.data
          ? placesNearby.data.map((place) => place.name)
          : [],
      })}
      onSelect={(s) => {
        onSelect(s.value);
      }}
      defaultValue={[placesNearby.data[0].name]}
    >
      <SelectTrigger>
        <SelectValueText />
      </SelectTrigger>
      <SelectContent>
        {placesNearby.data.map((item) => (
          <SelectItem key={item.name} item={item.name}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
