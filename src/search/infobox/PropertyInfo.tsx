import {
  Box,
  Button,
  Flex,
  Stack,
  Switch,
  SwitchLabel,
  Text,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPropertyGeometry } from '../../api/nkApiClient';
import { mapAtom } from '../../map/atoms';
import { mapLayers } from '../../map/layers';
import { capitalizeFirstLetter } from '../../shared/utils/stringUtils';
import { Property } from '../../types/searchTypes';
import {
  getPropertyDetailsByMatrikkelId,
  getPropetyInfoByCoordinates,
} from '../searchApi';

export interface PropertyInfoProps {
  lon: number;
  lat: number;
  inputCRS: string;
}

const fetchPropertyDetailsByCoordinates = async (
  lat4326: number,
  lon4326: number,
): Promise<Property | Property[]> => {
  const info = await getPropetyInfoByCoordinates(lat4326, lon4326);
  const property = info?.features?.[0]?.properties;
  if (!property) throw new Error('Ingen matrikkelreferanse funnet');
  const municipalityNumber = property.kommunenummer;
  const holdingNumber = property.gardsnummer;
  const subholdingNumber = property.bruksnummer;
  const leaseNumber = property.festenummer || '0';
  const sectionNumber = property.seksjonsnummer || '0';
  return getPropertyDetailsByMatrikkelId(
    municipalityNumber,
    holdingNumber,
    subholdingNumber,
    leaseNumber,
    sectionNumber,
  );
};

export const PropertyInfo = ({ lon, lat, inputCRS }: PropertyInfoProps) => {
  const { t } = useTranslation();
  const [lon4326, lat4326] = transform([lon, lat], inputCRS, 'EPSG:4326');
  const map = useAtomValue(mapAtom);
  useEffect(() => {
    return () => {
      const existingLayer = map
        .getLayers()
        .getArray()
        .find((layer) => layer.get('id') === 'propertyGeometryLayer');
      if (existingLayer) {
        map.removeLayer(existingLayer);
      }
    };
  }, [map]);

  const {
    data: propertyDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['propertyDetails', lat4326, lon4326],
    queryFn: () => fetchPropertyDetailsByCoordinates(lat4326, lon4326),
    enabled: lat4326 != null && lon4326 != null,
  });

  if (isLoading) return <>Laster eiendomsinformasjon...</>;
  if (error) return <>Feil ved henting av eiendomsinformasjon.</>;

  const property = Array.isArray(propertyDetails)
    ? propertyDetails[0]
    : propertyDetails;
  if (!property) {
    return <>Ingen eiendomsinformasjon funnet.</>;
  }

  const hasMultipleAddresses =
    Array.isArray(propertyDetails) && propertyDetails.length > 1;

  const rows = [
    [t('propertyInfo.municipalityNr'), property.KOMMUNENR],
    [t('infoBox.municipality'), capitalizeFirstLetter(property.KOMMUNENAVN)],
    [t('propertyInfo.holdingNr'), property.GARDSNR],
    [t('propertyInfo.subholdingNr'), property.BRUKSNR],
    [t('propertyInfo.leaseNr'), property.FESTENR],
    [t('propertyInfo.sectionNr'), property.SEKSJONSNR],
  ];

  const propertyRegisterUrl = `https://eiendomsregisteret.kartverket.no/eiendom/${property.KOMMUNENR}/${property.GARDSNR}/${property.BRUKSNR}/${property.FESTENR}/${property.SEKSJONSNR}`;

  const handleSwitchChange = async (checked: boolean) => {
    const existingLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === 'propertyGeometryLayer');
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
    if (checked) {
      const layerToAdd =
        mapLayers.propertyGeometryLayer.getLayer() as VectorLayer;
      const features = await getPropertyGeometry(
        property.KOMMUNENR,
        property.GARDSNR,
        property.BRUKSNR,
        property.FESTENR,
        property.SEKSJONSNR,
      );

      if (features) {
        layerToAdd.getSource()?.addFeatures(features);
        map.addLayer(layerToAdd);
      }
    }
  };

  return (
    <Box>
      <Stack gap={0}>
        {hasMultipleAddresses && (
          <Text mb={4} fontSize="sm">
            {t('propertyInfo.multipleAddressesText')}
          </Text>
        )}
        {rows.map(([label, value], index) => (
          <Flex
            key={label}
            justify="space-between"
            bg={index % 2 === 0 ? 'gray.50' : 'white'}
            p={2}
          >
            <Text fontSize="sm">{label}</Text>
            <Text fontSize="sm">{value}</Text>
          </Flex>
        ))}
      </Stack>
      <Flex justify="space-between" align="center">
        <Switch
          onCheckedChange={(e) => {
            handleSwitchChange(e.checked);
          }}
        >
          <SwitchLabel>{t('propertyInfo.markProperty.label')}</SwitchLabel>
        </Switch>
        <Button
          mt={4}
          size="xs"
          onClick={() =>
            window.open(propertyRegisterUrl, '_blank', 'noopener,noreferrer')
          }
        >
          {t('propertyInfo.moreInformation')}
        </Button>
      </Flex>
    </Box>
  );
};
