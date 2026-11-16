import {
  Box,
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
import type { TFunction } from 'i18next';
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
import { Property, SearchResult } from '../../types/searchTypes';
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

const getProperty = (
  selectedResult: SearchResult,
  coordinatePropertyDetails?: Property | Property[],
) => {
  if (selectedResult.type === 'Property') {
    return selectedResult.property;
  }

  return Array.isArray(coordinatePropertyDetails)
    ? coordinatePropertyDetails[0]
    : coordinatePropertyDetails;
};

const getPropertyRegisterUrl = (property?: Property) => {
  if (!property) {
    return null;
  }

  return `https://eiendomsregisteret.kartverket.no/eiendom/${property.KOMMUNENR}/${property.GARDSNR}/${property.BRUKSNR}/${property.FESTENR}/${property.SEKSJONSNR}`;
};

const getResultLabel = (
  selectedResult: SearchResult,
  property: Property | undefined,
  t: TFunction,
) => {
  if (property) {
    return t('locationType.property');
  }

  return t(
    `locationType.${selectedResult.type.toLowerCase()}`,
    selectedResult.type,
  );
};

const getMunicipality = (selectedResult: SearchResult) => {
  switch (selectedResult.type) {
    case 'Place':
      return selectedResult.place.municipalities?.[0]?.kommunenavn;
    case 'Road':
      return selectedResult.road.KOMMUNENAVN;
    case 'Address':
      return selectedResult.address.kommunenavn;
    default:
      return undefined;
  }
};

const getDisplayName = (property: Property | undefined, name: string) =>
  capitalizeFirstLetter((property?.NAVN ?? name).toLocaleLowerCase('nb-NO'));

const MobileInfoDetailsHeader = ({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Flex alignItems="center" gap={1}>
        <IconButton
          onClick={onBack}
          icon="keyboard_arrow_left"
          size="sm"
          variant="ghost"
          aria-label={t('infoBox.more')}
        />
        <Text fontWeight="semibold">{title}</Text>
      </Flex>
      <IconButton
        onClick={onClose}
        icon="close"
        size="sm"
        variant="ghost"
        aria-label={t('draw.close')}
      />
    </Flex>
  );
};

const PropertyRegisterLink = ({
  href,
  centered = false,
}: {
  href: string;
  centered?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Link
      href={href}
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
      alignSelf={centered ? 'center' : undefined}
      marginTop={centered ? 'auto' : undefined}
    >
      {t('propertyInfo.moreInformation')}
      <Icon icon="open_in_new" size={18} />
    </Link>
  );
};

const MobilePropertyDetails = ({
  selectedResult,
  inputCRS,
  propertyRegisterUrl,
  onBack,
  onClose,
}: {
  selectedResult: SearchResult;
  inputCRS: string;
  propertyRegisterUrl: string;
  onBack: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <MobileInfoDetailsHeader
        title={t('infoBox.propertyInfo')}
        onBack={onBack}
        onClose={onClose}
      />
      <PropertyInfo
        lon={selectedResult.lon}
        lat={selectedResult.lat}
        inputCRS={inputCRS}
        mobile
      />
      <InfoBoxElevationContent result={selectedResult} />
      <PropertyRegisterLink href={propertyRegisterUrl} centered />
    </>
  );
};

const MobileResultDetails = ({
  resultLabel,
  displayName,
  onBack,
  onClose,
}: {
  resultLabel: string;
  displayName: string;
  onBack: () => void;
  onClose: () => void;
}) => (
  <>
    <MobileInfoDetailsHeader
      title={resultLabel}
      onBack={onBack}
      onClose={onClose}
    />
    <InfoBoxContent showCloseButton={false} heading={displayName} />
  </>
);

const MobileInfoSummary = ({
  property,
  propertyRegisterUrl,
  resultDescription,
  displayName,
  onClose,
  onShowDetails,
}: {
  property?: Property;
  propertyRegisterUrl: string | null;
  resultDescription: string;
  displayName: string;
  onClose: () => void;
  onShowDetails: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap={0}>
          <Text fontSize="xs" color="gray.600">
            {resultDescription}
          </Text>
          <Heading size="sm">{displayName}</Heading>
          {property?.VEGADRESSE?.[0] && (
            <Text fontSize="sm" color="gray.600">
              {capitalizeFirstLetter(
                property.VEGADRESSE[0].toLocaleLowerCase('nb-NO'),
              )}
            </Text>
          )}
        </Stack>
        <IconButton
          onClick={onClose}
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
          <PropertyRegisterLink href={propertyRegisterUrl} />
        )}
        <Button
          variant="outline"
          colorPalette="green"
          size="sm"
          rightIcon="keyboard_arrow_up"
          onClick={onShowDetails}
        >
          {t('infoBox.more')}
        </Button>
      </Flex>
    </>
  );
};

export const MobileInfoBox = () => {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);
  const setMobileInfoDetailsOpen = useSetAtom(mobileInfoDetailsOpenAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);
  const [showDetails, setShowDetails] = useState(false);
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
    setMobileInfoDetailsOpen(false);
  }, [selectedResult, setMobileInfoDetailsOpen]);

  useEffect(() => {
    setMobileInfoDetailsOpen(showDetails);
  }, [showDetails, setMobileInfoDetailsOpen]);

  useEffect(() => {
    return () => {
      clearPropertyGeometrySelection();
    };
  }, []);

  if (selectedResult === null) {
    return null;
  }

  const property = getProperty(selectedResult, coordinatePropertyDetails);
  const propertyRegisterUrl = getPropertyRegisterUrl(property);
  const resultLabel = getResultLabel(selectedResult, property, t);
  const municipality = getMunicipality(selectedResult);
  const resultDescription = municipality
    ? `${resultLabel} ${t('infoBox.in')} ${capitalizeFirstLetter(
        municipality.toLocaleLowerCase('nb-NO'),
      )} ${t('infoBox.municipality').toLowerCase()}`
    : resultLabel;
  const displayName = getDisplayName(property, selectedResult.name);

  const handleClose = () => {
    clearPropertyGeometrySelection();
    setSelectedResult(null);
    setSearchCoordinates(null);
    setMobileInfoDetailsOpen(false);
    setShowDetails(false);
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
      {property && (
        <Box display={showDetails ? 'contents' : 'none'}>
          <MobilePropertyDetails
            selectedResult={selectedResult}
            inputCRS={inputCRS ?? 'EPSG:4258'}
            propertyRegisterUrl={propertyRegisterUrl!}
            onBack={() => setShowDetails(false)}
            onClose={handleClose}
          />
        </Box>
      )}
      {!property && showDetails && (
        <MobileResultDetails
          resultLabel={resultLabel}
          displayName={displayName}
          onBack={() => setShowDetails(false)}
          onClose={handleClose}
        />
      )}
      {!showDetails && (
        <MobileInfoSummary
          property={property}
          propertyRegisterUrl={propertyRegisterUrl}
          resultDescription={resultDescription}
          displayName={displayName}
          onClose={handleClose}
          onShowDetails={() => setShowDetails(true)}
        />
      )}
    </Stack>
  );
};
