import { Box, Separator, Text } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { getPlaceNamesByCoordinates } from '../searchApi';

interface PlaceInfoProps {
  lat: number;
  lon: number;
  inputCRS: string;
}

export const PlaceInfo = ({ lat, lon, inputCRS }: PlaceInfoProps) => {
  const [east, north] = transform([lon, lat], inputCRS, 'EPSG:25833');
  const { t } = useTranslation();

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

  const handlePlaceClick = (locationNumber: number) => {
    const url = `https://stadnamn.kartverket.no/fakta/${locationNumber}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      {placeData?.navn.map((place) => (
        <Box
          key={place.stedsnummer}
          mb={4}
          _hover={{ fontWeight: '600', cursor: 'pointer' }}
          onClick={() => handlePlaceClick(place.stedsnummer)}
        >
          {place.stedsnavn.map((placeName) => (
            <Text key={placeName.stedsnavnnummer}>{placeName.skrivemåte}</Text>
          ))}
          <Text fontSize="sm">
            {' '}
            {t('placeInfo.locationNumber')}: {place.stedsnummer}
          </Text>
          <Text fontSize="sm">
            {' '}
            {t('placeInfo.nameObjectType')}: {place.navneobjekttype}
          </Text>
          <Separator mt={2} />
        </Box>
      ))}
    </Box>
  );
};
