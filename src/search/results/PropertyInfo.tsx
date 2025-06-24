import { Box, Flex, Stack, Text } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { transform } from 'ol/proj';
import { getPropetyInfo } from '../searchApi';

export interface PropertyInfoProps {
  lon: number;
  lat: number;
  inputCRS: string;
}

export const PropertyInfo = ({ lon, lat, inputCRS }: PropertyInfoProps) => {
  const [lon4326, lat4326] = transform([lon, lat], inputCRS, 'EPSG:4326');

  const {
    data: propertyInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['propertyInfo', lat4326, lon4326],
    queryFn: () => getPropetyInfo(lat4326, lon4326),
    enabled: lat4326 != null && lon4326 != null,
  });

  if (isLoading) return <>Laster eiendomsinformasjon...</>;
  if (error) return <>Feil ved henting av eiendomsinformasjon.</>;

  const property = propertyInfo?.features?.[0]?.properties;

  if (!property) {
    return <>Ingen eiendomsinformasjon funnet.</>;
  }
  const rows = [
    ['Kommunenr:', property.kommunenummer],
    ['Gårdsnr:', property.gardsnummer],
    ['Bruksnr:', property.bruksnummer],
    ['Festenr:', property.festenummer],
    ['Seksjonsnr:', property.seksjonsnummer],
  ];

  return (
    <Box>
      <Stack>
        {rows.map(([label, value], index) => (
          <Flex
            key={label}
            justify="space-between"
            bg={index % 2 === 0 ? 'gray.50' : 'white'}
            px={2}
            py={2}
          >
            <Text fontSize="sm">{label}</Text>
            <Text fontSize="sm">{value}</Text>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};
