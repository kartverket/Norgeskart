import { Box, Separator, Text } from '@kvib/react';
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

  return (
    <Box>
      {placeData?.navn.map((place) => (
        <Box
          key={place.stedsnummer}
          mb={4}
          _hover={{ fontWeight: '600', cursor: 'pointer' }}
        >
          {place.stedsnavn.map((stedsnavn) => (
            <Text key={stedsnavn.stedsnavnnummer}>{stedsnavn.skrivemåte}</Text>
          ))}
          <Text fontSize="sm">Stedsnummer: {place.stedsnummer}</Text>
          <Text fontSize="sm">Navneobjekttype: {place.navneobjekttype}</Text>
          <Separator mt={2} />
        </Box>
      ))}
    </Box>
  );
};
