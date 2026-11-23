import { Box, Stack } from '@kvib/react';
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
import {
  MobileInfoSummary,
  MobilePropertyDetails,
  MobileResultDetails,
} from './MobileInfoBoxComponents';
import { findPropertyAddress, getPostalAddress } from './propertyAddress';
import { fetchPropertyDetailsByCoordinates } from './PropertyInfo';

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
    queryFn: () => {
      const [lon4326, lat4326] = transform(
        [selectedResult!.lon, selectedResult!.lat],
        inputCRS!,
        'EPSG:4326',
      );
      return fetchPropertyDetailsByCoordinates(lat4326, lon4326);
    },
    enabled: isPropertyLocationResult && inputCRS !== null,
  });
  const property = selectedResult
    ? getProperty(selectedResult, coordinatePropertyDetails)
    : undefined;
  const { data: addressDetails } = useQuery({
    queryKey: [
      'mobilePropertyAddress',
      property?.KOMMUNENR,
      property?.GARDSNR,
      property?.BRUKSNR,
      property?.VEGADRESSE?.[0],
    ],
    queryFn: () => findPropertyAddress(property!),
    enabled: Boolean(property?.VEGADRESSE?.[0]),
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
      gap={3}
      borderRadius="16px 16px 0 0"
      bg="white"
      boxShadow="lg"
      pointerEvents="auto"
      overflowY={showDetails ? 'auto' : 'hidden'}
      height={showDetails ? 'calc(100vh - 100px)' : 'auto'}
      maxHeight={showDetails ? 'calc(100vh - 100px)' : '52vh'}
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
          postalAddress={getPostalAddress(addressDetails)}
          onClose={handleClose}
          onShowDetails={() => setShowDetails(true)}
        />
      )}
    </Stack>
  );
};
