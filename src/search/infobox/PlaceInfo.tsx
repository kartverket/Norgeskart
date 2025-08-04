import { Box } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { transform } from 'ol/proj';
import { getPlaceNamesByCoordinates } from '../searchApi';

interface PlaceInfoProps {
  lat: number;
  lon: number;
  inputCRS: string;
}

export const PlaceInfo = ({ lat, lon, inputCRS }: PlaceInfoProps) => {
  const [east, north] = transform([lon, lat], inputCRS, 'EPSG:25833');

  const {
    data: placeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['placeNamesByCoordinates', north, east],
    queryFn: () => getPlaceNamesByCoordinates(north, east),
    enabled: north != null && east != null,
  });

  if (isLoading) return <>Laster stedsnavninformasjon...</>;
  if (error) return <>Feil ved henting av stedsnavninformasjon.</>;

  console.log('PlaceData info:', placeData);
  console.log('Placedata navn:', placeData?.navn);

  if (!placeData || !placeData.navn || placeData.navn.length === 0) {
    return <>Ingen stedsnavn funnet</>;
  }
  return <Box></Box>;
};
