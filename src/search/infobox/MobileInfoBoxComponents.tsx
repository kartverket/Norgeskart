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
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../shared/utils/stringUtils';
import { Property, SearchResult } from '../../types/searchTypes';
import { InfoBoxContent } from './InfoBoxContent';
import { InfoBoxElevationContent } from './InfoBoxPreamble';
import { PropertyInfo } from './PropertyInfo';

export const MobileInfoDetailsHeader = ({
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

export const PropertyRegisterLink = ({
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

export const MobilePropertyDetails = ({
  selectedResult,
  inputCRS,
  propertyRegisterUrl,
  postalAddress,
  onBack,
  onClose,
}: {
  selectedResult: SearchResult;
  inputCRS: string;
  propertyRegisterUrl: string;
  postalAddress?: string;
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
        postalAddress={postalAddress}
      />
      <InfoBoxElevationContent result={selectedResult} />
      <PropertyRegisterLink href={propertyRegisterUrl} centered />
    </>
  );
};

export const MobileResultDetails = ({
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

export const MobileInfoSummary = ({
  property,
  propertyRegisterUrl,
  resultDescription,
  displayName,
  postalAddress,
  onClose,
  onShowDetails,
}: {
  property?: Property;
  propertyRegisterUrl: string | null;
  resultDescription: string;
  displayName: string;
  postalAddress?: string;
  onClose: () => void;
  onShowDetails: () => void;
}) => {
  const { t } = useTranslation();
  const propertyAddress = property?.VEGADRESSE?.[0]
    ? capitalizeFirstLetter(
        property.VEGADRESSE[0].toLocaleLowerCase('nb-NO'),
      )
    : undefined;

  return (
    <>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap={0}>
          <Text fontSize="xs" color="gray.600">
            {resultDescription}
          </Text>
          <Heading size="sm">{propertyAddress || displayName}</Heading>
          {postalAddress && (
            <Text fontSize="sm" color="gray.600">
              {postalAddress}
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
