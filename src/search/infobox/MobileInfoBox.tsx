import {
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { transform } from 'ol/proj';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPropertyGeometryLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { capitalizeFirstLetter } from '../../shared/utils/stringUtils';
import { removeUrlParameter } from '../../shared/utils/urlUtils';
import {
  mobileInfoDetailsOpenAtom,
  searchCoordinatesAtom,
  selectedResultAtom,
} from '../atoms';
import { InfoBoxContent } from './InfoBoxContent';
import { InfoBoxElevationContent } from './InfoBoxPreamble';
import {
  fetchPropertyDetailsByCoordinates,
  PropertyInfo,
} from './PropertyInfo';

const clearPropertyGeometrySelection = () => {
  const propertyGeometryLayer = getPropertyGeometryLayer();
  if (propertyGeometryLayer) {
    propertyGeometryLayer.getSource()?.clear();
    getDefaultStore().get(mapAtom).removeLayer(propertyGeometryLayer);
  }
  removeUrlParameter('showSelection');
};

export const MobileInfoBox = () => {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);
  const setMobileInfoDetailsOpen = useSetAtom(mobileInfoDetailsOpenAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);
  const [showDetails, setShowDetails] = useState(false);
  const isPropertyResult = selectedResult?.type === 'Property';
  const isPropertyLocationResult =
    selectedResult?.type === 'Coordinate' || selectedResult?.type === 'Address';
  const inputCRS = selectedResult ? getInputCRS(selectedResult) : null;
  const { data: coordinatePropertyDetails } = useQuery({
    queryKey: [
      'mobilePropertyDetails',
      selectedResult?.lon,
      selectedResult?.lat,
    ],
    queryFn: () =>
      (() => {
        const [lon4326, lat4326] = transform(
          [selectedResult!.lon, selectedResult!.lat],
          inputCRS!,
          'EPSG:4326',
        );
        return fetchPropertyDetailsByCoordinates(lat4326, lon4326);
      })(),
    enabled: isPropertyLocationResult && inputCRS !== null,
  });

  useEffect(() => {
    setShowDetails(false);
    setMobileInfoDetailsOpen(false);
  }, [selectedResult, setMobileInfoDetailsOpen]);

  useEffect(() => {
    setMobileInfoDetailsOpen(showDetails);
  }, [showDetails, setMobileInfoDetailsOpen]);

  useEffect(() => {
    return () => {
      clearPropertyGeometrySelection();
    };
  }, [selectedResult]);

  if (selectedResult === null) {
    return null;
  }

  const property = isPropertyResult
    ? selectedResult.property
    : Array.isArray(coordinatePropertyDetails)
      ? coordinatePropertyDetails[0]
      : coordinatePropertyDetails;

  const propertyRegisterUrl = property
    ? `https://eiendomsregisteret.kartverket.no/eiendom/${property.KOMMUNENR}/${property.GARDSNR}/${property.BRUKSNR}/${property.FESTENR}/${property.SEKSJONSNR}`
    : null;
  const resultLabel = property
    ? t('locationType.property')
    : t(
        `locationType.${selectedResult.type.toLowerCase()}`,
        selectedResult.type,
      );
  const municipality =
    selectedResult.type === 'Place'
      ? selectedResult.place.municipalities?.[0]?.kommunenavn
      : selectedResult.type === 'Road'
        ? selectedResult.road.KOMMUNENAVN
        : selectedResult.type === 'Address'
          ? selectedResult.address.kommunenavn
          : undefined;
  const resultDescription = municipality
    ? `${resultLabel} ${t('infoBox.in')} ${capitalizeFirstLetter(
        municipality.toLocaleLowerCase('nb-NO'),
      )} ${t('infoBox.municipality').toLowerCase()}`
    : resultLabel;
  const displayName = capitalizeFirstLetter(
    (property?.NAVN ?? selectedResult.name).toLocaleLowerCase('nb-NO'),
  );

  const handleClose = () => {
    clearPropertyGeometrySelection();
    setSelectedResult(null);
    setSearchCoordinates(null);
    setMobileInfoDetailsOpen(false);
  };

  return (
    <Stack
      p={3}
      borderRadius="16px 16px 0 0"
      bg="white"
      boxShadow="lg"
      pointerEvents={'auto'}
      overflowY={showDetails ? 'auto' : 'hidden'}
      height={showDetails ? '90vh' : 'auto'}
      maxHeight={showDetails ? '90vh' : '52vh'}
      width="100%"
      display={isPrintDialogOpen ? 'none' : 'flex'}
      position="absolute"
      bottom={0}
      left={0}
      zIndex={3}
    >
      {showDetails ? (
        property ? (
          <>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={1}>
                <IconButton
                  onClick={() => setShowDetails(false)}
                  icon="keyboard_arrow_left"
                  size="sm"
                  variant="ghost"
                  aria-label={t('infoBox.more')}
                />
                <Text fontWeight="semibold">{t('infoBox.propertyInfo')}</Text>
              </Flex>
              <IconButton
                onClick={handleClose}
                icon="close"
                size="sm"
                variant="ghost"
                aria-label={t('draw.close')}
              />
            </Flex>
            <PropertyInfo
              lon={selectedResult.lon}
              lat={selectedResult.lat}
              inputCRS={inputCRS ?? 'EPSG:4258'}
              mobile
            />
            <InfoBoxElevationContent result={selectedResult} />
            {propertyRegisterUrl && (
              <Link
                href={propertyRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="white"
                bg="green.600"
                px={3}
                py={0}
                height="32px"
                borderRadius="sm"
                fontSize="sm"
                fontWeight="medium"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                textDecoration="none"
                alignSelf="center"
                marginTop="auto"
              >
                {t('propertyInfo.moreInformation')}
                <Icon icon="open_in_new" size={18} />
              </Link>
            )}
          </>
        ) : (
          <>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={1}>
                <IconButton
                  onClick={() => setShowDetails(false)}
                  icon="keyboard_arrow_left"
                  size="sm"
                  variant="ghost"
                  aria-label={t('infoBox.more')}
                />
                <Text fontWeight="semibold">{resultLabel}</Text>
              </Flex>
              <IconButton
                onClick={handleClose}
                icon="close"
                size="sm"
                variant="ghost"
                aria-label={t('draw.close')}
              />
            </Flex>
            <InfoBoxContent showCloseButton={false} heading={displayName} />
          </>
        )
      ) : (
        <>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Stack gap={0}>
              <Text fontSize="xs" color="gray.600">
                {resultDescription}
              </Text>
              <Heading size="sm">{displayName}</Heading>
              {property?.VEGADRESSE?.[0] && (
                <Text fontSize="sm" color="gray.600">
                  {property.VEGADRESSE[0]}
                </Text>
              )}
            </Stack>
            <IconButton
              onClick={handleClose}
              icon="close"
              size="sm"
              variant="ghost"
              aria-label={t('draw.close')}
            />
          </Flex>
          {property && (
            <Flex gap={2} wrap="wrap">
              <Text bg="blue.50" px={2} py={1} fontSize="xs">
                {t('propertyInfo.holdingNr')} {property.GARDSNR} /{' '}
                {t('propertyInfo.subholdingNr')} {property.BRUKSNR}
              </Text>
              <Text bg="blue.50" px={2} py={1} fontSize="xs">
                {t('propertyInfo.municipalityNr')} {property.KOMMUNENR}
              </Text>
            </Flex>
          )}
          <Flex justifyContent="space-between" alignItems="center" gap={2}>
            {propertyRegisterUrl && (
              <Link
                href={propertyRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="white"
                bg="green.600"
                px={3}
                py={0}
                height="32px"
                borderRadius="sm"
                fontSize="sm"
                fontWeight="medium"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                textDecoration="none"
              >
                {t('propertyInfo.moreInformation')}
                <Icon icon="open_in_new" size={18} />
              </Link>
            )}
            <Button
              variant="outline"
              colorPalette="green"
              size="sm"
              rightIcon="keyboard_arrow_up"
              onClick={() => setShowDetails(true)}
            >
              {t('infoBox.more')}
            </Button>
          </Flex>
        </>
      )}
    </Stack>
  );
};
